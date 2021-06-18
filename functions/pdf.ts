import moment from 'moment';

export const generateHeader = (doc: any, name: string) => {
  doc
    .image('assets/images/DEVcademy.png', 50, 45, { width: 200 })
    .fillColor('#444444')
    .fontSize(20)
    .text(name, 250, 120)
    .fontSize(10)
    .moveDown();
}

export const generateHr = (doc: any, y: number) => {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(570, y).stroke();
}

export const generateTableRow = (doc: any, y: number, c1: string, c2: string, c3: string) => {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 220, y)
    .text(c3, 270, y, { width: 90, align: 'right' })
    // .text(c4, 330, y, { width: 90, align: 'right' })
    // .text(c5, 500, y);
  generateHr(doc, y + 20);
}

export const generateTableRowTitles = (doc: any, y: number, c1: string, c2: string, c3: string) => {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 180, y)
    .text(c3, 290, y, { width: 90, align: 'right' })
    // .text(c4, 350, y, { width: 90, align: 'right' })
    // .text(c5, 0, y, { align: 'right' });
  generateHr(doc, y + 20);
}

export const generateFooter = (doc: any, startDate: Date, endDate: Date) => {
  doc
    .fontSize(10)
    .text(
      `This report was generated for the following dates: From ${moment(
        startDate
      ).format('MMMM Do YYYY, h:mm:ss a')} to  ${moment(endDate).format(
        'MMMM Do YYYY, h:mm:ss a'
      )}.`,
      50,
      710,
      { align: 'center', width: 500 }
    );
}

export const generateInvoiceTable = (doc: any, invoice: any) => {
  let i;
  const invoiceTableTop = 230;
  doc.font('Helvetica-Bold');
  generateTableRowTitles(
    doc,
    invoiceTableTop,
    'Course',
    'People enrolled',
    'Income (USD)'
  );
  doc.font('Helvetica');
  generateHr(doc, invoiceTableTop + 20);
  let positionTracker = invoiceTableTop + 30;
  for (i = 0; i < invoice.length; i++) {
    const item = invoice[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.name,
      item.peopleEnrolled,
      item.moneyGenerated
    );
    positionTracker = position;
  }
  return positionTracker;
}

export default {
  generateFooter,
  generateHeader,
  generateHr,
  generateInvoiceTable,
  generateTableRow,
  generateTableRowTitles,
};
