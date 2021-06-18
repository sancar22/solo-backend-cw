import { Router } from 'express';
const router = Router();

import {
  getAllTopics,
  getTopicsById,
  addTopic,
  editTopic,
  deleteTopic,
  getTopicsClientSide,
  getTopicById,
  getCompletedTopicsForCourse,
  submitTest
} from '../controllers/topic';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';

// router.get('/getInfo', authMiddleware, topicController.getInfo);

router.get(
  '/admin/getAllTopics',
  authMiddleware,
  authAdminMiddleware,
  getAllTopics
);

router.get(
  '/admin/getTopicById/:id',
  authMiddleware,
  authAdminMiddleware,
  getTopicsById
);

router.post(
  '/admin/add',
  authMiddleware,
  authAdminMiddleware,
  addTopic
);

router.put(
  '/admin/edit/:id',
  authMiddleware,
  authAdminMiddleware,
  editTopic
);

router.delete(
  '/admin/delete/:id',
  authMiddleware,
  authAdminMiddleware,
  deleteTopic
);

router.get(
  '/client-side/allTopics/:courseID',
  authMiddleware,
  getTopicsClientSide
);

router.get(
  '/client-side/getTopicById/:topicID',
  authMiddleware,
  getTopicById
);

router.get(
  '/client-side/completedTopics/:courseID',
  authMiddleware,
  getCompletedTopicsForCourse
);

router.post('/submitTest', authMiddleware, submitTest);

module.exports = router;
