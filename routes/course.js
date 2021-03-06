const express = require('express');

const router = express.Router();

const courseController = require('../controllers/course');
const authMiddleware = require('../middleware/auth');
const authAdminMiddleware = require('../middleware/admin');

// router.get('/getInfo', authMiddleware, courseController.getInfo);

router.get(
  '/admin/getAllCourses',
  authMiddleware,
  authAdminMiddleware,
  courseController.getAllCourses
);

router.get(
  '/admin/getCourseById/:id',
  authMiddleware,
  authAdminMiddleware,
  courseController.getCoursesById
);

router.post(
  '/admin/add',
  authMiddleware,
  authAdminMiddleware,
  courseController.addCourse
);

router.put(
  '/admin/edit/:id',
  authMiddleware,
  authAdminMiddleware,
  courseController.editCourse
);

router.delete(
  '/admin/delete/:id',
  authMiddleware,
  authAdminMiddleware,
  courseController.deleteCourse
);

router.get(
  '/client-side/allCourses',
  authMiddleware,
  courseController.getActivitiesClientSide
);

router.get(
  '/client-side/myCourses',
  authMiddleware,
  courseController.getMyCourses
);

router.post('/enroll/free', authMiddleware, courseController.enrollFreeCourse);
router.post(
  '/enroll/premium',
  authMiddleware,
  courseController.enrollPremiumCourse
);

module.exports = router;
