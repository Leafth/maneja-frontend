const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness } = require('./feeding-harness.cjs');

test('necessidade alimentar aceita decimais e rejeita quantidade inválida', () => {
  const h = harness();
  try {
    const { feedRequirementSchema } = h.load('src/features/feeding/schemas/feeding.schema.ts');
    assert.equal(feedRequirementSchema.safeParse({ feedLocalId: 'soja', quantityKg: '2,5' }).success, true);
    for (const quantityKg of ['', '0', '-1', '1,234', 'abc']) {
      assert.equal(feedRequirementSchema.safeParse({ feedLocalId: 'soja', quantityKg }).success, false);
    }
    assert.equal(feedRequirementSchema.safeParse({ feedLocalId: '', quantityKg: '2' }).success, false);
  } finally { h.close(); }
});

test('registro exige data real, horário válido e não permite alimentação futura', () => {
  const h = harness();
  try {
    const { registerFeedingSchema } = h.load('src/features/feeding/schemas/feeding.schema.ts');
    const values = { groupLocalId: 'grupo', feedLocalId: 'soja', quantityKg: '8', date: '01/01/2020', time: '07:30' };
    assert.equal(registerFeedingSchema.safeParse(values).success, true);
    for (const invalid of [{ date: '31/02/2020' }, { date: '01/01/2999' }, { time: '24:00' }, { time: '07:60' }, { groupLocalId: '' }]) {
      assert.equal(registerFeedingSchema.safeParse({ ...values, ...invalid }).success, false);
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    assert.equal(registerFeedingSchema.safeParse({ ...values, date: tomorrow.toLocaleDateString('pt-BR') }).success, false);
  } finally { h.close(); }
});

test('conversão preserva a data e o horário locais informados', () => {
  const h = harness();
  try {
    const { brDateTimeToIso, formatDateInput, formatTimeInput } = h.load('src/features/feeding/utils/feed-date.ts');
    const date = new Date(brDateTimeToIso('09/11/2026', '07:30'));
    assert.equal(date.getFullYear(), 2026);
    assert.equal(date.getMonth(), 10);
    assert.equal(date.getDate(), 9);
    assert.equal(date.getHours(), 7);
    assert.equal(date.getMinutes(), 30);
    assert.equal(formatDateInput('09112026'), '09/11/2026');
    assert.equal(formatTimeInput('0730'), '07:30');
  } finally { h.close(); }
});
