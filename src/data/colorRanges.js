// Color classification ranges for common reagent kits
// Based on published colorimetric drug test reference charts

export const REAGENT_KITS = {
  marquis: {
    name: 'Marquis Reagent',
    description: 'Detects opioids, amphetamines, MDMA',
    ranges: [
      {
        label: 'POSITIVE',
        substance: 'MDMA / Ecstasy (presumptive)',
        hMin: 0, hMax: 360,
        sMin: 0, sMax: 20,
        lMin: 0, lMax: 25,
        color: '#1a0a2e',
        confidence: 'HIGH',
      },
      {
        label: 'POSITIVE',
        substance: 'Heroin / Morphine / Codeine (presumptive)',
        hMin: 255, hMax: 320,
        sMin: 20, sMax: 100,
        lMin: 15, lMax: 55,
        color: '#6b21a8',
        confidence: 'HIGH',
      },
      {
        label: 'POSITIVE',
        substance: 'Amphetamine / Methamphetamine (presumptive)',
        hMin: 5, hMax: 40,
        sMin: 40, sMax: 100,
        lMin: 20, lMax: 55,
        color: '#b45309',
        confidence: 'HIGH',
      },
      {
        label: 'NEGATIVE',
        substance: 'No reaction detected',
        hMin: 40, hMax: 70,
        sMin: 30, sMax: 100,
        lMin: 55, lMax: 100,
        color: '#eab308',
        confidence: 'HIGH',
      },
    ],
  },
  mecke: {
    name: 'Mecke Reagent',
    description: 'Detects opioids, MDMA',
    ranges: [
      {
        label: 'POSITIVE',
        substance: 'MDMA / MDA (presumptive)',
        hMin: 180, hMax: 240,
        sMin: 30, sMax: 100,
        lMin: 10, lMax: 35,
        color: '#1e3a5f',
        confidence: 'HIGH',
      },
      {
        label: 'POSITIVE',
        substance: 'Heroin / Opioid (presumptive)',
        hMin: 100, hMax: 180,
        sMin: 30, sMax: 100,
        lMin: 10, lMax: 35,
        color: '#14532d',
        confidence: 'HIGH',
      },
      {
        label: 'NEGATIVE',
        substance: 'No reaction detected',
        hMin: 40, hMax: 70,
        sMin: 20, sMax: 100,
        lMin: 55, lMax: 100,
        color: '#eab308',
        confidence: 'HIGH',
      },
    ],
  },
  scott: {
    name: 'Scott Reagent',
    description: 'Specific for cocaine detection',
    ranges: [
      {
        label: 'POSITIVE',
        substance: 'Cocaine (presumptive)',
        hMin: 185, hMax: 225,
        sMin: 40, sMax: 100,
        lMin: 30, lMax: 65,
        color: '#0369a1',
        confidence: 'HIGH',
      },
      {
        label: 'NEGATIVE',
        substance: 'No reaction detected',
        hMin: 0, hMax: 360,
        sMin: 0, sMax: 15,
        lMin: 70, lMax: 100,
        color: '#e2e8f0',
        confidence: 'HIGH',
      },
    ],
  },
  generic: {
    name: 'Generic / Other',
    description: 'Manual classification mode',
    ranges: [],
  },
};
