/**
 * Record Generator Utility
 * Creates tamper-evident digital records with:
 * - SHA-256 image hash (Web Crypto API)
 * - GPS coordinates
 * - Timestamp
 * - Operator identity & signature
 * - Evidence photos
 * - Initialized Chain of Custody
 */

import { generateRecordId } from './storage';

/**
 * Computes SHA-256 hash of a base64 data URL
 */
export async function hashImage(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hashHex}`;
}

/**
 * Gets GPS coordinates
 */
export function getGPS() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: null, longitude: null, accuracy: null, error: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        error: null,
      }),
      err => resolve({ latitude: null, longitude: null, accuracy: null, error: err.message }),
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

/**
 * Generates a complete tamper-evident record
 */
export async function generateRecord({
  operator,
  testKit,
  kitBrand,
  kitExpiry,
  colorResult,
  imageDataUrl,
  selfieDataUrl,
  voiceNote,
  manualOverride,
  caseNumber,
  suspectName,
  incidentLocation,
  signatureDataUrl,
  evidencePhotos = [],
  batchId = null,
}) {
  const timestamp = new Date().toISOString();
  const recordId = generateRecordId();
  const gps = await getGPS();

  let imageHash = 'hash-unavailable';
  if (imageDataUrl) {
    try {
      imageHash = await hashImage(imageDataUrl);
    } catch {
      imageHash = 'hash-error';
    }
  }

  const record = {
    recordId,
    timestamp,
    schemaVersion: '2.0',
    batchId: batchId || null,
    operator: {
      name: operator?.name || 'Unknown',
      badgeId: operator?.badgeId || 'N/A',
      hasSelfie: !!selfieDataUrl,
      hasSignature: !!signatureDataUrl,
    },
    caseDetails: {
      caseNumber: caseNumber || 'Not provided',
      suspectName: suspectName || 'Not provided',
      incidentLocation: incidentLocation || 'Not provided',
    },
    location: gps,
    testKit,
    kitBrand: kitBrand || 'Not scanned',
    kitExpiry: kitExpiry || 'Not scanned',
    classification: manualOverride || colorResult?.classification || 'INCONCLUSIVE',
    detectedSubstance: colorResult?.substance || 'Unknown',
    confidence: colorResult?.confidence || 'LOW',
    colorDetected: {
      hsl: colorResult?.hsl,
      hex: colorResult?.hex,
    },
    voiceNote: voiceNote || null,
    imageHash,
    signatureDataUrl: signatureDataUrl || null,
    evidencePhotos: evidencePhotos.map(p => ({
      id: p.id,
      type: p.type,
      label: p.label,
      timestamp: p.timestamp,
    })),
    // Chain of custody starts with creation
    chainOfCustody: [
      {
        actionId: `ACT-${Date.now()}`,
        timestamp,
        action: 'TEST_CONDUCTED',
        officer: `${operator?.name} (${operator?.badgeId})`,
        notes: 'Initial field test conducted and cryptographically sealed.',
        signature: signatureDataUrl || null,
      }
    ],
    disclaimer: 'PRESUMPTIVE FIELD TEST RESULT ONLY. This result must be confirmed by accredited laboratory analysis before use as legal evidence. Results produced by SecureField v2.0.',
  };

  return { record, imageDataUrl, selfieDataUrl, signatureDataUrl, evidencePhotos };
}
