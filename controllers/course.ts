import Stripe from 'stripe';
import CourseModel from '../models/course';
import { Course } from '../models/course';
import Topic from '../models/topic';
import UserCourseModel from '../models/userCourse';
import { UserCourse } from '../models/userCourse';
import UserTopic from '../models/userTopic';
import uploadFile from '../functions/uploadFile';
import {Request, Response} from 'express';

const { secretAPITestStripe } = process.env;
const secret = `${secretAPITestStripe}`;

interface ArgumentToFind {
  enabled: boolean;
}
interface ArgumentToFindOne extends ArgumentToFind {
  _id: string;
}

const stripe = new Stripe(secret, {
  apiVersion: '2020-08-27',
});

interface ClientCourse extends Course {
  enrolled: boolean;
  free: boolean;
  formattedPrice: number;

}
interface ClientUserCourse extends UserCourse {
  topicsCompleted: number;
  numberOfTopics: number;
  name: string;
  coverImageURL: string;
  ratioFinished: number;
}

// This will give information in a way that can be read by the tables in the admin page
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const arg: ArgumentToFind = { enabled: true };
    const courses = await CourseModel.find({arg});
    if (!courses) return res.send('No courses are available!');
    const filteredKeys = [
      {
        field: 'name',
        headerName: 'Name',
        type: 'string',
        required: true,
      },
      {
        field: 'description',
        headerName: 'Description',
        type: 'string',
        required: true,
      },
      { field: 'price', headerName: 'Price', type: 'currency', required: true },
      {
        field: 'coverImageURL',
        headerName: 'Cover Image',
        type: 'image',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    // this is for dropdown in admin when chosing a grade for the creation of a topic
    const modifiedCourse = [];
    for (let i = 0; i < courses.length; i++) {
      const { name, _id } = courses[i];
      modifiedCourse.push({ title: name, value: _id });
    }
    const tableOptions = { show: true, edit: true, delete: true };
    const entityName = 'course';
    const categoryName = 'Course';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: courses,
      tableOptions,
      entityName,
      categoryName,
      modifiedCourse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const getCoursesById = async (req: Request, res: Response) => {
  try {
    const arg: ArgumentToFindOne = {
      _id: req.params.id,
      enabled: true,
    }
    const course = await CourseModel.findOne({arg}).lean();

    if (!course) return res.send('Course does not exist!');
    course.price = parseFloat(course.price.toString());
    const filteredKeys = [
      {
        field: 'name',
        headerName: 'Name',
        type: 'string',
        required: true,
      },
      {
        field: 'description',
        headerName: 'Description',
        type: 'string',
        required: true,
      },
      { field: 'price', headerName: 'Price', type: 'currency', required: true },
      {
        field: 'coverImageURL',
        headerName: 'Cover Image',
        type: 'image',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: true, delete: true };
    const entityName = 'course';
    const categoryName = 'Course';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: course,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const addCourse = async (req: Request, res: Response) => {
  try {
    let price: string = req.body.price;
    const { coverImageURL, name, description } = req.body;
    if (!coverImageURL)
      return res.status(400).send('You have to insert a cover image!');
    if (!price) price = '0';

    const { data, mime } = coverImageURL;
    const URLfromS3 = await uploadFile(data, mime);
    const product = await stripe.products.create({
      name: name.trim(),
    });
    const priceStripe = await stripe.prices.create({
      unit_amount: Number(Number(price).toFixed(2)) * 100,
      currency: 'usd',
      product: product.id,
    });
    const course = new CourseModel({
      name: name.trim(),
      description: description.trim(),
      price,
      coverImageURL: URLfromS3,
      priceStripeID: priceStripe.id,
    });
    await course.save();
    res.status(200).send('Course added successfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const editCourse = async (req: Request, res: Response) => {
  try {
    let { price } = req.body;
    const { coverImageURL, name, description } = req.body;

    const arg: ArgumentToFindOne = {
      _id: req.params.id,
      enabled: true,
    }
    const course = await CourseModel.findOne({arg}).lean();
    if (course) {
      if (!price) price = 0;
      let URLfromS3;
      if (coverImageURL && coverImageURL !== course.coverImageURL) {
        const { data, mime } = coverImageURL;
        const url = await uploadFile(data, mime)
        URLfromS3 =  url ? url : '';
      }

      let priceID = course.priceStripeID;
      if (course.price !== price) {
        const product = await stripe.products.create({
          name: name.trim(),
        });
        const priceStripe = await stripe.prices.create({
          unit_amount: Number(Number(price).toFixed(2)) * 100,
          currency: 'usd',
          product: product.id,
        });
        priceID = priceStripe.id;
      }
      await CourseModel.updateOne(
        { _id: req.params.id },
        {
          $set: {
            name: name.trim(),
            description: description.trim(),
            coverImageURL: URLfromS3 !== '' ? URLfromS3 : course.coverImageURL,
            price,
            priceStripeID: priceID,
          },
        }
      );

      res.status(200).send('Course edited successfully!');
    } else {
      res.status(404).send('Course not found');
    }
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

// Logical delete
export const deleteCourse = async (req: Request, res: Response) => {
  const courseID = req.params.id;
  try {
    await CourseModel.updateOne(
      { _id: courseID },
      { $set: {enabled: false}}
    );
    // deleting topics related to course
    await Topic.updateMany({ courseID }, { enabled: false });
    await UserCourseModel.updateMany({ courseID }, { enabled: false });
    await UserTopic.updateMany({ courseID }, { enabled: false });
    res.status(200).send('Course deleted succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const enrollFreeCourse = async (req: Request, res: Response) => {
  try {
    const { course } = req.body;
    const userID = res.locals.user.id;
    await UserCourseModel.create({
      userID,
      courseID: course._id,
      coursePricePaid: 0,
    });
    res.status(200).send('Enrolled succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const enrollPremiumCourse = async (req: Request, res: Response) => {
  try {
    const { course } = req.body;
    const userID = res.locals.user.id;
    await UserCourseModel.create({
      userID,
      courseID: course._id,
      coursePricePaid: 0,
    });
    res.status(200).send('Enrolled succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const getActivitiesClientSide = async (req: Request, res: Response) => {
  try {
    const userID = res.locals.user.id;
    const userActiveCourses = await UserCourseModel.find({ userID, enabled: true });
    const allAvailableCourses = await CourseModel.find({ enabled: true }).lean();

    const isMyCourse = (courseID: string) =>
      userActiveCourses.filter(
        (course) => course.courseID.toString() === courseID.toString()
      ).length === 1;

    const ClientCourseArray: ClientCourse[] = [];
    for (let i = 0; i < allAvailableCourses.length; i++) {
      const { price } = allAvailableCourses[i];
      const currentCourse: ClientCourse = {...allAvailableCourses[i],
          enrolled: false,
          free: false,
          formattedPrice: parseFloat(
            parseFloat(price.toString()).toFixed(2)
          ),
      };
      if (isMyCourse(currentCourse._id)) {
        currentCourse.enrolled = true;
      }
      if (currentCourse.formattedPrice === 0) {
        currentCourse.free = true;
      }
      ClientCourseArray.push(currentCourse);
    }

    ClientCourseArray.sort((course) => (course.enrolled ? -1 : 1));

    res.status(200).send(ClientCourseArray);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const getMyCourses = async (req: Request, res: Response) => {
  try {
    const userID = res.locals.user.id;
    const userActiveCourses = await UserCourseModel.find({
      userID,
      enabled: true,
    }).lean();

    const ClientUserCourseArray: ClientUserCourse[] = [];
    for (let i = 0; i < userActiveCourses.length; i++) {
      const currentCourse = userActiveCourses[i];
      const topicsFromCourse = await Topic.find({
        courseID: currentCourse.courseID,
        enabled: true,
      });
      const topicsCompleted = await UserTopic.find({
        courseID: currentCourse.courseID,
        enabled: true,
        userID,
      });
      const course = await CourseModel.findById(currentCourse.courseID);
      if (course) {
        const currentUserCourse: ClientUserCourse = { ...currentCourse,
          topicsCompleted: topicsCompleted.length,
          numberOfTopics:topicsFromCourse.length,
          name: course.name,
          coverImageURL: course.coverImageURL,
          ratioFinished: parseFloat(
            (topicsCompleted.length / topicsFromCourse.length).toFixed(2)
          )
        }
        ClientUserCourseArray.push(currentUserCourse);
      }
    }
    res.status(200).send(ClientUserCourseArray);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
