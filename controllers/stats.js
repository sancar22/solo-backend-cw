const PDFDocument = require('pdfkit');
const { ObjectID } = require('mongodb');
const moment = require('moment');
const Course = require('../models/course');
const UserTopic = require('../models/userTopic');
const {
  generateFooter,
  generateHeader,
  generateInvoiceTable,
} = require('../functions/pdf');

exports.getGlobalStats = async (req, res) => {
  try {
    const { startDateQuery, endDateQuery } = req.query;
    const startDate = new Date(startDateQuery);
    const endDate = new Date(endDateQuery);
    const globalMoneyQuery = await Course.aggregate([
      {
        $match: {
          enabled: true,
        },
      },
      {
        $lookup: {
          from: 'usercourses',
          let: { courseID: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$courseID', '$$courseID'],
                },
              },
            },
            {
              $project: {
                coursePricePaid: 1,
                createdAt: 1,
              },
            },
          ],
          as: 'courseUserInfo',
        },
      },
      {
        $unwind: '$courseUserInfo',
      },
      {
        $addFields: {
          purchasedDate: '$courseUserInfo.createdAt',
        },
      },
      {
        $match: {
          purchasedDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          moneyGenerated: { $sum: '$courseUserInfo.coursePricePaid' },
          peopleEnrolled: { $sum: 1 },
          name: { $first: '$name' },
        },
      },
      {
        $addFields: {
          moneyGenerated: { $toString: '$moneyGenerated' },
        },
      },
    ]);
    let totalMoneyGenerated = 0;
    let totalPeopleEnrolled = 0;
    for (let i = 0; i < globalMoneyQuery.length; i++) {
      totalMoneyGenerated += parseFloat(globalMoneyQuery[i].moneyGenerated);
      totalPeopleEnrolled += globalMoneyQuery[i].peopleEnrolled;
    }
    const doc = new PDFDocument({ margin: 50 });
    generateHeader(doc, 'Global Report');
    doc.font('Helvetica-Bold');
    const currentHeight = generateInvoiceTable(doc, globalMoneyQuery);
    doc.moveDown();
    doc
      .fontSize(10)
      .text(
        `The profit generated  from ${moment(startDate).format(
          'MMMM Do YYYY, h:mm:ss a'
        )} to  ${moment(endDate).format(
          'MMMM Do YYYY, h:mm:ss a'
        )} was ${totalMoneyGenerated} USD. `,
        50,
        currentHeight + 30
      )
      .moveDown();
    doc
      .fontSize(10)
      .text(
        `Total number of people enrolled in courses during these dates: ${totalPeopleEnrolled}.`,
        50,
        currentHeight + 50
      )
      .moveDown();
    generateFooter(doc, startDate, endDate);
    doc.pipe(res);
    doc.end();
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.getAllTestResults = async (req, res) => {
  try {
    const userTests = await UserTopic.aggregate([
      {
        $match: {
          enabled: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          let: { courseID: '$courseID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$courseID'],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: 'courseInfo',
        },
      },
      {
        $lookup: {
          from: 'topics',
          let: { topicID: '$topicID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$topicID'],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: 'topicInfo',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userID: '$userID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$userID'],
                },
              },
            },
            {
              $project: {
                name: 1,
                email: 1,
              },
            },
          ],
          as: 'userInfo',
        },
      },
      {
        $addFields: {
          courseName: { $arrayElemAt: ['$courseInfo', 0] },
          topicName: { $arrayElemAt: ['$topicInfo', 0] },
          userNameEmail: { $arrayElemAt: ['$userInfo', 0] },
          scoreString: { $concat: [{ $toString: '$score' }, '%'] },
        },
      },
      {
        $addFields: {
          courseName: '$courseName.name',
          topicName: '$topicName.name',
          userName: '$userNameEmail.name',
          userEmail: '$userNameEmail.email',
        },
      },
      {
        $project: {
          totalQuestions: 1,
          correctQuestions: 1,
          courseName: 1,
          topicName: 1,
          userName: 1,
          userEmail: 1,
          scoreString: 1,
        },
      },
    ]);
    const filteredKeys = [
      {
        field: 'courseName',
        headerName: 'Course Name',
        type: 'string',
        required: true,
      },
      {
        field: 'topicName',
        headerName: 'Topic Name',
        type: 'string',
        required: true,
      },
      {
        field: 'userName',
        headerName: 'User Name',
        type: 'string',
        required: true,
      },
      {
        field: 'userEmail',
        headerName: 'User Email',
        type: 'string',
        required: true,
      },
      {
        field: 'correctQuestions',
        headerName: 'Correct Questions',
        type: 'string',
        required: true,
      },
      {
        field: 'totalQuestions',
        headerName: 'Total Questions',
        type: 'string',
        required: true,
      },
      {
        field: 'scoreString',
        headerName: 'Score',
        type: 'string',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: false, delete: false };
    const entityName = 'testResults';
    const categoryName = 'TestResults';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: userTests,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.getTestResultById = async (req, res) => {
  try {
    const userTests = await UserTopic.aggregate([
      {
        $match: {
          enabled: true,
          _id: ObjectID(req.params.id),
        },
      },
      {
        $lookup: {
          from: 'courses',
          let: { courseID: '$courseID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$courseID'],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: 'courseInfo',
        },
      },
      {
        $lookup: {
          from: 'topics',
          let: { topicID: '$topicID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$topicID'],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: 'topicInfo',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userID: '$userID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$userID'],
                },
              },
            },
            {
              $project: {
                name: 1,
                email: 1,
              },
            },
          ],
          as: 'userInfo',
        },
      },
      {
        $addFields: {
          courseName: { $arrayElemAt: ['$courseInfo', 0] },
          topicName: { $arrayElemAt: ['$topicInfo', 0] },
          userNameEmail: { $arrayElemAt: ['$userInfo', 0] },
          scoreString: { $concat: [{ $toString: '$score' }, '%'] },
        },
      },
      {
        $addFields: {
          courseName: '$courseName.name',
          topicName: '$topicName.name',
          userName: '$userNameEmail.name',
          userEmail: '$userNameEmail.email',
        },
      },
      {
        $project: {
          totalQuestions: 1,
          correctQuestions: 1,
          courseName: 1,
          topicName: 1,
          userName: 1,
          userEmail: 1,
          scoreString: 1,
          responses: 1,
        },
      },
    ]);
    const filteredKeys = [
      {
        field: 'courseName',
        headerName: 'Course Name',
        type: 'string',
        required: true,
      },
      {
        field: 'topicName',
        headerName: 'Topic Name',
        type: 'string',
        required: true,
      },
      {
        field: 'userName',
        headerName: 'User Name',
        type: 'string',
        required: true,
      },
      {
        field: 'userEmail',
        headerName: 'User Email',
        type: 'string',
        required: true,
      },
      {
        field: 'correctQuestions',
        headerName: 'Correct Questions',
        type: 'string',
        required: true,
      },
      {
        field: 'totalQuestions',
        headerName: 'Total Questions',
        type: 'string',
        required: true,
      },
      {
        field: 'scoreString',
        headerName: 'Score',
        type: 'string',
        required: true,
      },
      {
        field: 'responses',
        headerName: 'User response',
        type: 'array',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: false, delete: false };
    const entityName = 'testResults';
    const categoryName = 'TestResults';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: userTests[0],
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
