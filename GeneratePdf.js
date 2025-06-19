const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const data = JSON.parse(fs.readFileSync("sample.json", "utf8"));

function generatePDF(data) {
  const doc = new PDFDocument({ margin: 50 });

  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfBuffer = Buffer.concat(buffers);
    fs.mkdirSync("output", { recursive: true });
    fs.writeFileSync("output/PatientSummary.pdf", pdfBuffer);
    console.log("✅ PDF saved to output/PatientSummary.pdf");
  });

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

  doc.end();
}

module.exports = { generatePDF };
