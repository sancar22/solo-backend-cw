import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';
import adminController from '../controllers/admin/topic';
import clientController from '../controllers/client/topic';

const router = Router();

// admin
router.get(
  '/admin/getAllTopics',
  authMiddleware,
  authAdminMiddleware,
  adminController.getAllTopics,
);

router.get(
  '/admin/getTopicById/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.getTopicsById,
);

router.post(
  '/admin/add',
  authMiddleware,
  authAdminMiddleware,
  adminController.addTopic,
);

router.put(
  '/admin/edit/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.editTopic,
);

router.delete(
  '/admin/delete/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.deleteTopic,
);

// client
router.get(
  '/client-side/allTopics/:courseID',
  authMiddleware,
  clientController.getTopicsClientSide,
);

router.get(
  '/client-side/getTopicById/:topicID',
  authMiddleware,
  clientController.getTopicById,
);

router.get(
  '/client-side/completedTopics/:courseID',
  authMiddleware,
  clientController.getCompletedTopicsForCourse,
);

router.post('/submitTest', authMiddleware, clientController.submitTest);

export default router;
