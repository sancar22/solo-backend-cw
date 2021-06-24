import Stripe from 'stripe';
import CourseModel from '../../models/course';
import { Course } from '../../models/course';
import Topic from '../../models/topic';
import UserCourseModel from '../../models/userCourse';
import UserTopic from '../../models/userTopic';
import uploadFile from '../../lib/uploadFile';
import {Request, Response} from 'express';
import { UpdateQuery } from 'mongoose';


const secret = String(process.env.SECRET_API_TEST_STRIPE);

const stripe = new Stripe(secret, {
  apiVersion: '2020-08-27',
});


const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await CourseModel.find({ enabled: true });
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

const getCoursesById = async (req: Request, res: Response) => {
  try {
    const course = await CourseModel.findOne({
      _id: req.params.id,
      enabled: true,
    }).lean();

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

const addCourse = async (req: Request, res: Response) => {
  try {
    let price: string = req.body.price;
    const { coverImageURL, name, description } = req.body;
    if (!coverImageURL)
      return res.status(400).send('You have to insert a cover image!');
    if (!price) price = '0';

    //TODO
    // what is happening here, update the docs
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
    res.status(201).send('Course added successfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

const editCourse = async (req: Request, res: Response) => {
  try {
    let { price } = req.body;
    const { coverImageURL, name, description } = req.body;

    const course = await CourseModel.findOne({
      _id: req.params.id,
      enabled: true,
    }).lean();

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

const deleteCourse = async (req: Request, res: Response) => {
  const courseID = req.params.id;
  const update: UpdateQuery<Course> = {enabled: false};

  try {
    await CourseModel.updateOne(
      { _id: courseID },
      update,
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

export default {
  getAllCourses, getCoursesById, addCourse, editCourse, deleteCourse
}
