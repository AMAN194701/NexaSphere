import PDFDocument from 'pdfkit';

export async function renderCertificatePdf({ variables } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50,
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Background and Border
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
      doc
        .lineWidth(5)
        .strokeColor('#2563eb')
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .stroke();
      doc
        .lineWidth(1)
        .strokeColor('#e5e7eb')
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke();

      doc.y = 120; // Set starting Y position for text

      // Title
      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(42)
        .text('CERTIFICATE OF COMPLETION', { align: 'center' });
      doc.moveDown(1.5);

      // Subtitle
      doc
        .fillColor('#4b5563')
        .font('Helvetica')
        .fontSize(18)
        .text('This is to certify that', { align: 'center' });
      doc.moveDown(1);

      // Name
      doc
        .fillColor('#2563eb')
        .font('Helvetica-Bold')
        .fontSize(36)
        .text(variables?.attendeeName || 'Valued Attendee', { align: 'center' });
      doc.moveDown(1);

      // Description
      doc
        .fillColor('#4b5563')
        .font('Helvetica')
        .fontSize(18)
        .text('has successfully participated in and completed:', { align: 'center' });
      doc.moveDown(0.5);

      // Event Name
      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(24)
        .text(variables?.eventName || 'NexaSphere Event', { align: 'center' });

      // Footer
      const footerY = doc.page.height - 120;
      doc.fillColor('#6b7280').font('Helvetica').fontSize(12);
      doc.text(
        `Date Issued: ${variables?.date || new Date().toISOString().slice(0, 10)}`,
        100,
        footerY
      );
      doc.text(`Certificate Code: ${variables?.code || 'UNVERIFIED'}`, 100, footerY + 20);

      if (variables?.verifyUrl) {
        doc
          .fillColor('#2563eb')
          .text(`Verify at: ${variables.verifyUrl}`, doc.page.width - 400, footerY, {
            align: 'right',
          });
      } else {
        doc
          .fillColor('#6b7280')
          .text(`NexaSphere Certification`, doc.page.width - 300, footerY, { align: 'right' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
// Code-first PDF generator placeholder.
// TODO: replace with real renderer (HTML->PDF or canvas->PDF).

function safeText(value, fallback = '') {
  const text = String(value ?? fallback).trim();
  return text || fallback;
}

function addLabeledLine(doc, label, value, y) {
  doc.fontSize(10).fillColor('#6b7280').text(label, 56, y, { width: 120 });
  doc
    .fontSize(16)
    .fillColor('#111827')
    .text(value, 56, y + 14, { width: 480 });
}

export async function renderCertificatePdf({ event, attendee, code, issuedAt, verifyUrl } = {}) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    compress: false,
    info: {
      Title: `Certificate ${code || ''}`.trim(),
      Author: 'NexaSphere',
      Subject: 'Event certificate',
    },
  });

  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const completionDate = issuedAt ? new Date(issuedAt) : new Date();
  const completionLabel = Number.isNaN(completionDate.getTime())
    ? 'Issued recently'
    : completionDate.toLocaleDateString();

  doc.roundedRect(32, 32, 530, 770, 24).fillAndStroke('#f8fafc', '#dbeafe');

  doc
    .fillColor('#0f172a')
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('Certificate of Completion', 56, 76);

  doc
    .fillColor('#334155')
    .fontSize(13)
    .font('Helvetica')
    .text('This certificate confirms successful participation in the NexaSphere event.', 56, 116, {
      width: 470,
      lineGap: 4,
    });

  doc.moveTo(56, 152).lineTo(504, 152).strokeColor('#bfdbfe').lineWidth(1.2).stroke();

  addLabeledLine(
    doc,
    'Awarded to',
    safeText(attendee?.name || attendee?.full_name || attendee?.email, 'Participant'),
    184
  );
  addLabeledLine(doc, 'Event', safeText(event?.name, 'NexaSphere Event'), 248);
  addLabeledLine(doc, 'Certificate Code', safeText(code, 'PENDING'), 312);
  addLabeledLine(doc, 'Issued On', completionLabel, 376);

  doc.fillColor('#475569').fontSize(11).text('Completion Details', 56, 452, { underline: true });
  doc
    .fillColor('#111827')
    .fontSize(12)
    .text(
      safeText(
        event?.description ||
          'Attendance and completion were verified through the NexaSphere event workflow.',
        'Attendance and completion were verified through the NexaSphere event workflow.'
      ),
      56,
      474,
      { width: 470, lineGap: 4 }
    );

  if (verifyUrl) {
    doc
      .fillColor('#2563eb')
      .fontSize(11)
      .text(`Verify online: ${verifyUrl}`, 56, 612, { width: 470 });
  }

  doc
    .fillColor('#64748b')
    .fontSize(9)
    .text('Generated by NexaSphere automated certificate workflow.', 56, 708, {
      align: 'center',
      width: 470,
    });

  doc.end();

  return await new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}
