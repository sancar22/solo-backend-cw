import { Router } from 'express';
const router = Router();

import {
  getAllCourses,
  getCoursesById,
  addCourse,
  editCourse,
  deleteCourse,
  getActivitiesClientSide,
  getMyCourses,
  enrollFreeCourse,
  enrollPremiumCourse
 } from '../controllers/course';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';

// router.get('/getInfo', authMiddleware, courseController.getInfo);

router.get('/admin/getAllCourses',authMiddleware, authAdminMiddleware, getAllCourses);

router.get(
  '/admin/getCourseById/:id',
  authMiddleware,
  authAdminMiddleware,
  getCoursesById
);

router.post(
  '/admin/add',
  authMiddleware,
  authAdminMiddleware,
  addCourse
);

router.put(
  '/admin/edit/:id',
  authMiddleware,
  authAdminMiddleware,
  editCourse
);

router.delete(
  '/admin/delete/:id',
  authMiddleware,
  authAdminMiddleware,
  deleteCourse
);

router.get(
  '/client-side/allCourses',
  authMiddleware,
  getActivitiesClientSide
);

router.get(
  '/client-side/myCourses',
  authMiddleware,
  getMyCourses
);

router.post('/enroll/free', authMiddleware, enrollFreeCourse);

router.post(
  '/enroll/premium',
  authMiddleware,
  enrollPremiumCourse
);

export default router;
