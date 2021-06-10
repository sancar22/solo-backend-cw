const PDFDocument = require('pdfkit');
const Course = require('../models/course');
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
    const doc = new PDFDocument({ margin: 50 });
    generateHeader(doc, 'DevCademy - Global Report');
    doc.font('Helvetica-Bold');
    generateInvoiceTable(doc, globalMoneyQuery);
    generateFooter(doc, startDate, endDate);
    doc.pipe(res);
    doc.end();
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
