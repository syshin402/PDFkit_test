const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const data = JSON.parse(fs.readFileSync("sample.json", "utf8"));

function generatePDF(data) {
  const { userProfile, labOrder, testResults, signerInfo, verificationLink } = data;
  const doc = new PDFDocument({ margin: 50 });

  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfBuffer = Buffer.concat(buffers);
    fs.mkdirSync("output", { recursive: true });
    fs.writeFileSync("output/PatientSummary.pdf", pdfBuffer);
    console.log("✅ PDF saved to output/PatientSummary.pdf");
  });

  // Header Content
  const logoPath = path.join(__dirname, "assets", "MedfiloLogo.png");
  if (!fs.existsSync(logoPath)) 
    throw new Error(`Logo not found: ${logoPath}`);
  doc.image(logoPath, 40, 40, { width: 100 });
  doc.moveDown(8);

  // Main Content
  const leftData = [
    ['Patient Name',    `${userProfile.firstName} ${userProfile.lastName}`],
    ['Date of Birth',   userProfile.dateOfBirth],
    ['Patient ID',      userProfile.id],
    ['Gender',          userProfile.gender]
  ];
  const rightData = [
    ['Report ID',        labOrder.labOrderId],
    ['Sample Collected', labOrder.specimenDate],
    ['Report Date',      labOrder.reportDate],
    ['Lab Name',         labOrder.labName],
    ['Lab Address',      labOrder.labAddress]
  ];
  const leftX  = doc.page.margins.left;
  const rightX = doc.page.width * 0.5;
  let yPos = doc.y;
  doc.fontSize(10);
  leftData.forEach(([lbl, val]) => {
    doc.font('Helvetica-Bold').text(lbl + ':', leftX,    yPos);
    doc.font('Helvetica').     text(val,      leftX+100, yPos);
    yPos += doc.currentLineHeight() + 6;
  });

  yPos = doc.y - leftData.length * (doc.currentLineHeight() + 6);
  rightData.forEach(([lbl, val]) => {
    doc.font('Helvetica-Bold').text(lbl + ':', rightX,    yPos);
    doc.font('Helvetica').     text(val,      rightX+100, yPos);
    yPos += doc.currentLineHeight() + 6;
  });
  doc.moveDown(2);

  const headings = ["Test Name","LOINC","Result","Units","Reference","Status"];
  const widths  = [140, 60, 60, 50, 80, 60];
  let y = doc.y; 
  let x = 40;
  doc.font("Helvetica-Bold").fontSize(10);
  headings.forEach((h,i) => { doc.text(h, x, y, { width: widths[i] }); x += widths[i] });
  doc.moveTo(40, y + doc.currentLineHeight()+2)
     .lineTo(550, y + doc.currentLineHeight()+2)
     .stroke();
  y += doc.currentLineHeight() + 8;
  doc.font("Helvetica").fontSize(10);
  let currentY = y;

  for (const { testName, loincCode, resultValue, unit, referenceRange, status } of testResults) {
    let currentX = 40;

    const columns = [
      testName,
      loincCode,
      resultValue,
      unit,
      referenceRange,
      status
    ];

    for (let i = 0; i < columns.length; i++) {
      doc.text(columns[i], currentX, currentY, { width: widths[i] });
      currentX += widths[i];
    }

    currentY += doc.currentLineHeight() + 8;
  }
  doc.moveDown(15);

  // Signature Section
  y = doc.y;
  const marginLeft = doc.page.margins.left;

  doc.font("Helvetica-Bold")
    .fontSize(10)
    .text(`Electronically signed by: ${signerInfo.name} (${signerInfo.position})`, marginLeft, y);

  y += doc.currentLineHeight() + 4;
  doc.font("Helvetica")
    .fontSize(10)
    .text(`Lab Technician`, marginLeft, y);

  y += doc.currentLineHeight() + 4;
  doc.font("Helvetica")
    .text("__________________", marginLeft, y);

  y += doc.currentLineHeight() + 4;
  doc.font("Helvetica")
    .fontSize(10)
    .text(`Lab Technician`, marginLeft, y);

  y += doc.currentLineHeight() + 4;
  doc.font("Helvetica")
    .text("_______________________________________________", marginLeft, y);

  y += doc.currentLineHeight() + 8;
  doc.fontSize(9)
    .text("This document has been digitally signed and verified.", marginLeft, y);

  y = doc.y + doc.currentLineHeight() * 2;
  doc.fontSize(9)
    .text(
      "Thank you for choosing ABC Laboratory. For questions, contact support@abclab.com.",
      marginLeft,
      y,
      {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: "center"
      }
    );

  /*
  doc.fontSize(20).text("Patient Health Summary", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(12).text(`Patient Name: ${data.patientName}`);
  doc.text(`Date of Birth: ${data.dob}`);
  doc.text(`Gender: ${data.gender}`);
  doc.text(`Diagnosis: ${data.diagnosis}`);
  doc.text(`Doctor: ${data.doctor}`);
  doc.text(`Visit Date: ${data.visitDate}`);
  doc.moveDown();

  doc.font("Helvetica-Bold").text("Medications:");
  doc.font("Helvetica");
  data.medications.forEach((med, i) => {
    doc.text(`  ${i + 1}. ${med}`);
  });
  */

  doc.end();
}

module.exports = { generatePDF };
