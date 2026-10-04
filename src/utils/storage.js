// Utility: Storage management using localStorage

const KEYS = {
  OPERATOR: 'secureField_operator',
  TESTS: 'secureField_tests',
  BATCHES: 'secureField_batches',
};

export function saveOperator(operator) {
  localStorage.setItem(KEYS.OPERATOR, JSON.stringify(operator));
}

export function getOperator() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.OPERATOR));
  } catch {
    return null;
  }
}

export function clearOperator() {
  localStorage.removeItem(KEYS.OPERATOR);
}

export function saveTest(record) {
  const tests = getTests();
  // If test already exists, update it; otherwise append
  const idx = tests.findIndex(t => t.recordId === record.recordId);
  if (idx >= 0) {
    tests[idx] = record;
  } else {
    tests.push(record);
  }
  localStorage.setItem(KEYS.TESTS, JSON.stringify(tests));
}

export function getTests() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.TESTS)) || [];
  } catch {
    return [];
  }
}

export function getTestById(recordId) {
  return getTests().find(t => t.recordId === recordId);
}

export function deleteTest(recordId) {
  const tests = getTests().filter(t => t.recordId !== recordId);
  localStorage.setItem(KEYS.TESTS, JSON.stringify(tests));
}

export function generateRecordId() {
  const tests = getTests();
  const count = String(tests.length + 1).padStart(5, '0');
  const yy = new Date().getFullYear();
  return `NCB-SF-${yy}-${count}`;
}

/**
 * Chain of Custody: Append a custody action to a test record
 * e.g., 'SUPERVISOR_REVIEW', 'LAB_DISPATCH', 'EVIDENCE_LOCKER'
 */
export function addCustodyAction(recordId, { action, officer, notes, signatureDataUrl }) {
  const tests = getTests();
  const test = tests.find(t => t.recordId === recordId);
  if (!test) return null;

  if (!test.chainOfCustody) {
    test.chainOfCustody = [];
  }

  test.chainOfCustody.push({
    actionId: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action, // 'SUPERVISOR_VERIFIED' | 'LAB_TRANSFER' | 'EVIDENCE_SEALED'
    officer: officer || 'Unknown',
    notes: notes || '',
    signature: signatureDataUrl || null,
  });

  saveTest(test);
  return test;
}

/**
 * Batch Testing: Save or update a batch of tests
 */
export function getBatches() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.BATCHES)) || [];
  } catch {
    return [];
  }
}

export function saveBatch(batch) {
  const batches = getBatches();
  const idx = batches.findIndex(b => b.batchId === batch.batchId);
  if (idx >= 0) {
    batches[idx] = batch;
  } else {
    batches.push(batch);
  }
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(batches));
}

export function generateBatchId() {
  const batches = getBatches();
  const count = String(batches.length + 1).padStart(4, '0');
  const yy = new Date().getFullYear();
  return `BATCH-${yy}-${count}`;
}
