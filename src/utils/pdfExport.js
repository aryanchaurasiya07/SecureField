/**
 * PDF Export Utility using jsPDF & qrcode
 * Generates an official, court-ready report with:
 * - Scannable Verification QR Code
 * - Digital Signature
 * - Supporting Evidence Photos (substance, packaging, label)
 * - Chain of Custody Audit Trail
 */
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export async function exportToPDF(record, imageDataUrl, selfieDataUrl, signatureDataUrl, evidencePhotos = []) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 15;

  const LINE_H = 6;
  const MARGIN = 15;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SecureField — Official Field Test Record', W / 2, 11, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Narcotics Control Bureau · Ministry of Home Affairs, Government of India', W / 2, 18, { align: 'center' });
  doc.text('CONFIDENTIAL // DIGITAL CHAIN OF CUSTODY DOCUMENT', W / 2, 24, { align: 'center' });

  y = 34;

  // ── Generate QR Code Data URL ───────────────────────────────────────────
  let qrDataUrl = null;
  try {
    const qrPayload = JSON.stringify({
      id: record.recordId,
      time: record.timestamp,
      hash: record.imageHash?.slice(0, 20),
      res: record.classification,
      officer: record.operator?.name,
    });
    qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 120 });
  } catch (e) {
    console.error('QR code generation failed:', e);
  }

  // Draw QR Code in top right if available
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', W - MARGIN - 24, y - 2, 24, 24);
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('SCAN TO VERIFY', W - MARGIN - 12, y + 24, { align: 'center' });
    } catch {}
  }

  // ── Classification Banner ────────────────────────────────────────────────
  const cls = record.classification || 'INCONCLUSIVE';
  const clsColors = {
    POSITIVE: [185, 28, 28],
    NEGATIVE: [22, 101, 52],
    INCONCLUSIVE: [180, 83, 9],
  };
  const [cr, cg, cb] = clsColors[cls] || clsColors.INCONCLUSIVE;
  doc.setFillColor(cr, cg, cb);
  doc.roundedRect(MARGIN, y, W - MARGIN * 2 - (qrDataUrl ? 28 : 0), 16, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`RESULT: ${cls}`, MARGIN + 6, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Presumptive Substance: ${record.detectedSubstance || 'Unknown'} (Confidence: ${record.confidence || 'LOW'})`, MARGIN + 6, y + 13);
  y += 24;

  // ── Helper: Draw Section & Rows ──────────────────────────────────────────
  const section = (title) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(MARGIN, y, W - MARGIN * 2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(title, MARGIN + 3, y + 4.5);
    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8.5);
  };

  const row = (label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, MARGIN + 3, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value || 'N/A'), W - MARGIN * 2 - 45);
    doc.text(lines, MARGIN + 42, y);
    y += Math.max(LINE_H, lines.length * 4.5);
  };

  // ── 1. Record & Case Info ────────────────────────────────────────────────
  section('1. RECORD & CASE INFORMATION');
  row('Record ID', record.recordId);
  if (record.batchId) row('Batch / Operation', record.batchId);
  row('Date & Time (IST)', new Date(record.timestamp).toLocaleString('en-IN'));
  if (record.caseDetails?.caseNumber) row('FIR / Case No.', record.caseDetails.caseNumber);
  if (record.caseDetails?.suspectName) row('Suspect / Seizure', record.caseDetails.suspectName);
  if (record.caseDetails?.incidentLocation) row('Incident Location', record.caseDetails.incidentLocation);

  // ── 2. Officer & Geolocation ─────────────────────────────────────────────
  section('2. OFFICER IDENTIFICATION & SATELLITE GPS');
  row('Conducting Officer', `${record.operator?.name} (Badge: ${record.operator?.badgeId})`);
  row('GPS Coordinates', record.location?.latitude ? `${record.location.latitude.toFixed(6)}°N, ${record.location.longitude.toFixed(6)}°E (Accuracy: ±${Math.round(record.location.accuracy || 0)}m)` : 'GPS Unreachable');
  row('Reagent Test Kit', `${record.testKit} · ${record.kitBrand || 'Generic'}`);

  // ── 3. Colorimetric Analysis & Integrity Hash ─────────────────────────────
  section('3. COLORIMETRIC ANALYSIS & CRYPTOGRAPHIC HASH');
  row('Detected Hue/Color', `${record.colorDetected?.hex || 'N/A'} (HSL: ${record.colorDetected?.hsl?.h || 0}°, ${record.colorDetected?.hsl?.s || 0}%, ${record.colorDetected?.hsl?.l || 0}%)`);
  doc.setFont('helvetica', 'bold');
  doc.text('SHA-256 Image Hash:', MARGIN + 3, y);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text(record.imageHash || 'N/A', MARGIN + 42, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  if (record.voiceNote) {
    row('Officer Field Notes', record.voiceNote);
  }

  // ── 4. Main Photo & Signatures ────────────────────────────────────────────
  if (imageDataUrl) {
    if (y > 210) { doc.addPage(); y = 15; }
    section('4. PRIMARY TEST RESULT PHOTOGRAPH');
    try {
      doc.addImage(imageDataUrl, 'JPEG', MARGIN, y, W - MARGIN * 2, 58);
      y += 63;
    } catch {}
  }

  // ── 5. Officer Signature & Selfie ─────────────────────────────────────────
  if (signatureDataUrl || selfieDataUrl) {
    if (y > 225) { doc.addPage(); y = 15; }
    section('5. IDENTITY & DIGITAL SIGNATURE');

    if (selfieDataUrl) {
      try {
        doc.addImage(selfieDataUrl, 'JPEG', MARGIN + 3, y, 32, 24);
        doc.setFontSize(7);
        doc.text('Operator Photo', MARGIN + 3, y + 27);
      } catch {}
    }

    if (signatureDataUrl) {
      try {
        const sigX = selfieDataUrl ? MARGIN + 45 : MARGIN + 3;
        doc.addImage(signatureDataUrl, 'PNG', sigX, y, 50, 24);
        doc.setFontSize(7);
        doc.text('E-Signature (Signed on Device)', sigX, y + 27);
      } catch {}
    }
    y += 32;
  }

  // ── 6. Chain of Custody Audit Log ─────────────────────────────────────────
  if (record.chainOfCustody && record.chainOfCustody.length > 0) {
    if (y > 220) { doc.addPage(); y = 15; }
    section('6. VERIFIABLE CHAIN OF CUSTODY LOG');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Timestamp', MARGIN + 3, y);
    doc.text('Action', MARGIN + 42, y);
    doc.text('Authorized Personnel', MARGIN + 85, y);
    doc.text('Notes', MARGIN + 130, y);
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN + 3, y, W - MARGIN - 3, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    record.chainOfCustody.forEach(c => {
      doc.text(new Date(c.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), MARGIN + 3, y);
      doc.text(c.action.replace('_', ' '), MARGIN + 42, y);
      doc.text(String(c.officer || '').slice(0, 25), MARGIN + 85, y);
      doc.text(String(c.notes || '').slice(0, 30), MARGIN + 130, y);
      y += 5;
    });
    y += 4;
  }

  // ── Supporting Evidence Gallery (Page 2 / overflow) ───────────────────────
  if (evidencePhotos && evidencePhotos.length > 0) {
    doc.addPage();
    y = 15;
    section('7. SUPPORTING EVIDENCE PHOTOGRAPHS');

    const photoW = (W - MARGIN * 2 - 10) / 2;
    const photoH = 45;

    for (let i = 0; i < evidencePhotos.length; i++) {
      const p = evidencePhotos[i];
      const col = i % 2;
      const xPos = MARGIN + col * (photoW + 10);

      try {
        doc.addImage(p.dataUrl, 'JPEG', xPos, y, photoW, photoH);
        doc.setFontSize(7.5);
        doc.text(`${p.label || 'Evidence'} — ${new Date(p.timestamp).toLocaleTimeString()}`, xPos, y + photoH + 4);
      } catch {}

      if (col === 1 || i === evidencePhotos.length - 1) {
        y += photoH + 10;
      }
    }
  }

  // ── Legal Disclaimer Footer ───────────────────────────────────────────────
  if (y > 250) { doc.addPage(); y = 15; }
  doc.setFillColor(254, 243, 199);
  doc.rect(MARGIN, y, W - MARGIN * 2, 16, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.text('LEGAL NOTICE & STATUTORY DISCLAIMER', MARGIN + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('This record documents a presumptive colorimetric test only. Under the NDPS Act / relevant statutes, presumptive findings', MARGIN + 3, y + 9);
  doc.text('must be corroborated by quantitative laboratory testing (GC-MS/HPLC) before admission as substantive evidence in court.', MARGIN + 3, y + 13);

  // ── Page numbering ────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`SecureField v2.0 · NCB Official Record · Page ${i} of ${pageCount} · Generated ${new Date().toISOString()}`, W / 2, 292, { align: 'center' });
  }

  doc.save(`${record.recordId}.pdf`);
}
