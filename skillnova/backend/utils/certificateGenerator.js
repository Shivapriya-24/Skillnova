const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function getDisplayName(username, email) {
  if (username && username.trim()) {
    return username.trim();
  }
  if (!email) return 'Unknown User';
  const base = email.split('@')[0]; 
  const cleaned = base.replace(/[^a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || 'User';
}

module.exports.generateCertificate = async function generateCertificate(session) {
  const certificatesDir = path.join(__dirname, '..', 'public', 'certificates');
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const filename = `Certificate_${session.skillName}_${session._id}.pdf`;
  const filepath = path.join(certificatesDir, filename);

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
  doc.pipe(fs.createWriteStream(filepath));

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  doc.rect(0, 0, pageWidth, pageHeight).fill('#f4f1ff'); 
  doc.fillColor('#000'); 

  doc.save();
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
     .lineWidth(4)
     .stroke('#4B0082');
  doc.restore();

  doc.moveDown(1.3);
  doc.font('Helvetica-Bold')
     .fillColor('#4B0082')
     .fontSize(42)
     .text('SkillNova', { align: 'center' });

  doc.moveDown(0.2);
  doc.fontSize(28)
     .fillColor('#0a4d8c')
     .text('Certificate of Completion', { align: 'center' });

  const learnerName = getDisplayName(session.requesterName, session.requesterEmail);
  const instructorName = getDisplayName(session.teacherName, session.teacherEmail);

  doc.moveDown(1.5);
  doc.font('Helvetica')
     .fontSize(18)
     .fillColor('#000')
     .text('This is to certify that', { align: 'center' });

  doc.moveDown(0.5);
  doc.font('Helvetica-Bold')
     .fontSize(32)
     .fillColor('#4B0082')
     .text(learnerName, { align: 'center' });

  doc.moveDown(0.6);
  doc.font('Helvetica')
     .fontSize(18)
     .fillColor('#000')
     .text('has successfully completed the session on', { align: 'center' });

  doc.moveDown(0.4);
  doc.font('Helvetica-Bold')
     .fontSize(26)
     .fillColor('#0a4d8c')
     .text(session.skillName, { align: 'center' });

  doc.moveTo(100, pageHeight - 180)
     .lineTo(pageWidth - 100, pageHeight - 180)
     .lineWidth(1.5)
     .stroke('#4B0082');

  const footerY = pageHeight - 150;
  const formattedDate = new Date().toLocaleDateString();

  doc.font('Helvetica')
     .fontSize(14)
     .fillColor('#000')
     .text('_________________________', 80, footerY - 20);
  doc.text('Signature', 130, footerY + 5);

  doc.fontSize(16)
     .text(`Instructor: ${instructorName}`, 80, footerY + 35);

  doc.fontSize(16)
     .text(`Date: ${formattedDate}`, pageWidth - 220, footerY + 35, { align: 'right' });

  const verifyUrl = `https://your-platform.com/verify-certificate/${session._id}`;
  doc.fontSize(12)
     .fillColor('#444')
     .text(`Verify this certificate at: ${verifyUrl}`, 0, pageHeight - 60, {
       align: 'center',
       underline: true,
     });

  doc.end();
  return `/certificates/${filename}`;
};
