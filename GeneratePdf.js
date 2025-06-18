const PDF = require('pdfkit');


const { userProfile, labOrder, testResults, signerInfo } = require('./sample.json');

function generatePdf() {
    const doc = new PDF({margin: 30, size: 'A4'});
    

}