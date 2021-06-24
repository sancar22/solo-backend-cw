import { Request, Response } from 'express';
import CourseModel, { Course } from '../../models/course';
import UserCourseModel, { UserCourse } from '../../models/userCourse';
import UserTopicModel from '../../models/userTopic';
import TopicModel from '../../models/topic';

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

const calculateCourseProgress = async (userCourses: UserCourse[], userID: string) => {
  const result: ClientUserCourse[] = [];

  for (let i = 0; i < userCourses.length; i++) {
    const currentCourse = userCourses[i];

    const topicsFromCourse = await TopicModel.find({
      courseID: currentCourse.courseID,
      enabled: true,
    });

    const topicsCompleted = await UserTopicModel.find({
      courseID: currentCourse.courseID,
      enabled: true,
      userID,
    });

    const course = await CourseModel.findById(currentCourse.courseID);
    if (course) {
      const currentUserCourse: ClientUserCourse = {
        ...currentCourse,
        topicsCompleted: topicsCompleted.length,
        numberOfTopics: topicsFromCourse.length,
        name: course.name,
        coverImageURL: course.coverImageURL,
        ratioFinished: parseFloat(
          (topicsCompleted.length / topicsFromCourse.length).toFixed(2),
        ),
      };
      result.push(currentUserCourse);
    }
  }
  return result;
};

// TODO, refactor
const getActivitiesClientSide = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID = res.locals.user.id;
    const userActiveCourses = await UserCourseModel.find({ userID, enabled: true });
    const allAvailableCourses = await CourseModel.find({ enabled: true }).lean();

    const isMyCourse = (courseID: string) => userActiveCourses.filter(
      (course) => course.courseID.toString() === courseID.toString(),
    ).length === 1;

    const ClientCourseArray: ClientCourse[] = [];
    for (let i = 0; i < allAvailableCourses.length; i++) {
      const { price } = allAvailableCourses[i];
      const currentCourse: ClientCourse = {
        ...allAvailableCourses[i],
        enrolled: false,
        free: false,
        formattedPrice: parseFloat(
          parseFloat(price.toString()).toFixed(2),
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

const getMyCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID = res.locals.user.id;
    const userActiveCourses = await UserCourseModel.find({
      userID,
      enabled: true,
    }).lean();

    const userCoursesWithStats = await calculateCourseProgress(
      userActiveCourses,
      userID,
    );

    res.status(200).send(userCoursesWithStats);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

const enrollFreeCourse = async (req: Request, res: Response): Promise<void> => {
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

export default {
  getActivitiesClientSide, getMyCourses, enrollFreeCourse,
};
