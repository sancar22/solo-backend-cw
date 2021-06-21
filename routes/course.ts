import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';
import adminController from '../controllers/admin/course';
import clientController from '../controllers/client/course';


const router = Router();

// admin
router.get(
  '/admin/getAllCourses',
  authMiddleware,
  authAdminMiddleware,
  adminController.getAllCourses
);

router.get(
  '/admin/getCourseById/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.getCoursesById
);

router.post(
  '/admin/add',
  authMiddleware,
  authAdminMiddleware,
  adminController.addCourse
);

router.put(
  '/admin/edit/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.editCourse
);

router.delete(
  '/admin/delete/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.deleteCourse
);



// client
router.get(
  '/client-side/allCourses',
  authMiddleware,
  clientController.getActivitiesClientSide
);

router.get(
  '/client-side/myCourses',
  authMiddleware,
  clientController.getMyCourses
);

router.post(
  '/enroll/free',
  authMiddleware,
  clientController.enrollFreeCourse
);

router.post(
  '/enroll/premium',
  authMiddleware,
  clientController.enrollPremiumCourse
);

export default router;
