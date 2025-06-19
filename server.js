const { generatePDF } = require("./GeneratePdf");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

generatePDF(JSON.parse(fs.readFileSync("sample.json", "utf8")));

setTimeout(() => {
  const pdfPath = path.join(__dirname, "output", "PatientSummary.pdf");

  const openCmd = process.platform === "darwin"
    ? `open "${pdfPath}"`
    : process.platform === "win32"
    ? `start "" "${pdfPath}"`
    : `xdg-open "${pdfPath}"`;

  exec(openCmd, (err) => {
    if (err) {
      console.error("❌ Failed to preview:", err);
    } else {
      console.log("📄 PDF preview opened");
    }
  });

  const downloadsPath = path.join(require("os").homedir(), "Downloads", "PatientSummary.pdf");
  fs.copyFile(pdfPath, downloadsPath, (err) => {
    if (err) throw err;
    console.log("⬇️ PDF copied to folder.");
  });

}, 1000); 
