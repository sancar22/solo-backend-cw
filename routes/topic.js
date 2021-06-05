const express = require('express');

const router = express.Router();

const topicController = require('../controllers/topic');
const authMiddleware = require('../middleware/auth');
const authAdminMiddleware = require('../middleware/admin');

// router.get('/getInfo', authMiddleware, topicController.getInfo);

router.get(
  '/admin/getAllTopics',
  authMiddleware,
  authAdminMiddleware,
  topicController.getAllTopics
);

router.get(
  '/admin/getTopicById/:id',
  authMiddleware,
  authAdminMiddleware,
  topicController.getTopicsById
);

router.post(
  '/admin/add',
  authMiddleware,
  authAdminMiddleware,
  topicController.addTopic
);

router.put(
  '/admin/edit/:id',
  authMiddleware,
  authAdminMiddleware,
  topicController.editTopic
);

router.delete(
  '/admin/delete/:id',
  authMiddleware,
  authAdminMiddleware,
  topicController.deleteTopic
);

router.get(
  '/client-side/allTopics/:courseID',
  authMiddleware,
  topicController.getTopicsClientSide
);

router.get(
  '/client-side/getTopicById/:topicID',
  authMiddleware,
  topicController.getTopicById
);

router.post('/submitTest', authMiddleware, topicController.submitTest);

module.exports = router;
