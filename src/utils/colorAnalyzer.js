/**
 * Color Analyzer Utility
 * Extracts dominant color from a canvas region, applies white-balance correction
 * using the reference color card, then classifies against reagent ranges.
 */

import { REAGENT_KITS } from '../data/colorRanges';

/**
 * Converts RGB to HSL
 */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Samples average RGB of a rectangular region from a canvas
 */
function sampleRegion(ctx, x, y, w, h) {
  const data = ctx.getImageData(x, y, w, h).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]; g += data[i + 1]; b += data[i + 2];
    count++;
  }
  return { r: r / count, g: g / count, b: b / count };
}

/**
 * Converts RGB to hex string
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/**
 * Main analysis function.
 * @param {HTMLImageElement} imgEl - Captured image element
 * @param {string} kitType - e.g., 'marquis'
 * @returns {{ hsl, hex, classification, substance, confidence, correctedRgb }}
 */
export function analyzeColor(imgEl, kitType) {
  const canvas = document.createElement('canvas');
  canvas.width = imgEl.naturalWidth || imgEl.width;
  canvas.height = imgEl.naturalHeight || imgEl.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

  const W = canvas.width;
  const H = canvas.height;

  // Reference card region: TOP 25% strip (user places color card here)
  const refRgb = sampleRegion(ctx, Math.floor(W * 0.3), Math.floor(H * 0.05), Math.floor(W * 0.4), Math.floor(H * 0.15));

  // Test kit region: CENTER of bottom 60% (sample 20% x 20% box)
  const testX = Math.floor(W * 0.4);
  const testY = Math.floor(H * 0.5);
  const testW = Math.floor(W * 0.2);
  const testH = Math.floor(H * 0.2);
  const rawRgb = sampleRegion(ctx, testX, testY, testW, testH);

  // White-balance correction using reference card
  // Assume reference card white patch should be (200, 200, 200)
  const targetGray = 200;
  const scaleR = refRgb.r > 10 ? targetGray / refRgb.r : 1;
  const scaleG = refRgb.g > 10 ? targetGray / refRgb.g : 1;
  const scaleB = refRgb.b > 10 ? targetGray / refRgb.b : 1;

  const correctedRgb = {
    r: Math.min(255, rawRgb.r * scaleR),
    g: Math.min(255, rawRgb.g * scaleG),
    b: Math.min(255, rawRgb.b * scaleB),
  };

  const hsl = rgbToHsl(correctedRgb.r, correctedRgb.g, correctedRgb.b);
  const hex = rgbToHex(correctedRgb.r, correctedRgb.g, correctedRgb.b);

  // Classify
  const kit = REAGENT_KITS[kitType];
  if (!kit || kit.ranges.length === 0) {
    return { hsl, hex, correctedRgb: rawRgb, rawRgb, classification: 'INCONCLUSIVE', substance: 'Manual review required', confidence: 'LOW' };
  }

  for (const range of kit.ranges) {
    const hMatch = hsl.h >= range.hMin && hsl.h <= range.hMax;
    const sMatch = hsl.s >= range.sMin && hsl.s <= range.sMax;
    const lMatch = hsl.l >= range.lMin && hsl.l <= range.lMax;

    if (hMatch && sMatch && lMatch) {
      return { hsl, hex, correctedRgb, rawRgb, classification: range.label, substance: range.substance, confidence: range.confidence };
    }
  }

  return { hsl, hex, correctedRgb, rawRgb, classification: 'INCONCLUSIVE', substance: 'Color does not match known patterns — manual review required', confidence: 'LOW' };
}
