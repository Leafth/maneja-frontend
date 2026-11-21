const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./feeding-harness.cjs');

test('planning validates scopes, dates and inclusive one-day period without calculating quantities', () => {
  const h = harness();
  try {
    const { feedPlanningSchema: schema } = h.load('src/features/feeding/schemas/feed-planning.schema.ts');
    const form = { scope: 'all', groupLocalId: '', startDate: '2026-11-11', endDate: '2026-11-11' };
    assert.equal(schema.safeParse(form).success, true);
    assert.equal(schema.safeParse({ ...form, scope: 'group' }).success, false);
    assert.equal(schema.safeParse({ ...form, scope: 'group', groupLocalId: 'g' }).success, true);
    assert.equal(schema.safeParse({ ...form, scope: 'all_groups' }).success, false);
    for (const date of ['2026-02-30', '11/11/2026', 'bad', '2026-13-01']) assert.equal(schema.safeParse({ ...form, startDate: date }).success, false);
    assert.equal(schema.safeParse({ ...form, endDate: '2026-11-10' }).success, false);
    const { feedingSchema } = h.load('src/features/feeding/schemas/feeding.schema.ts');
    assert.equal(feedingSchema.safeParse({ feedLocalId: 'f', quantity: '1,25', occurredAt: '2030-01-01 15:00' }).success, true);
    for (const quantity of ['0', '-1', '1.001', 'Infinity']) assert.equal(feedingSchema.safeParse({ feedLocalId: 'f', quantity, occurredAt: '2026-11-11 15:00' }).success, false);
    assert.equal(feedingSchema.safeParse({ feedLocalId: 'f', quantity: '1', occurredAt: '2026-02-30 25:00' }).success, false);
  } finally { h.close(); }
});

test('planning is online-only, propagates API error and maps server quantities', async () => {
  let online = false; let calls = 0; let fail = false;
  const h = harness({
    '@/infrastructure/network/network.service': { networkService: { isConnected: async () => online } },
    '@/infrastructure/api': { api: { post: async (url, body) => {
      calls++; assert.equal(url, '/feed_planning');
      if (fail) throw new Error('API indisponível');
      return { data: { period: { start_date: '2026-11-11', end_date: '2026-11-11', days: 1 },
        scope: body.feed_planning.scope === 'all' ? { type: 'all' } : { type: 'group', group_id: 'rg' },
        data: [{ feed_id: 'rf', feed_name: 'Ração', stock_quantity: '80.0', required_quantity: '100.0', missing_quantity: '20.0', sufficient: false }] } };
    } } },
  });
  try {
    const service = h.load('src/features/feeding/services/feed-planning.service.ts').feedPlanningService;
    const body = { feed_planning: { scope: 'all', start_date: '2026-11-11', end_date: '2026-11-11' } };
    await assert.rejects(service.calculate(body), /conexão/); assert.equal(calls, 0);
    online = true;
    assert.equal((await service.calculate(body)).items[0].requiredScaled, 10000);
    assert.equal((await service.calculate({ feed_planning: { ...body.feed_planning, scope: 'group', group_id: 'rg' } })).scope.groupRemoteId, 'rg');
    fail = true; await assert.rejects(service.calculate(body), /API indisponível/); assert.equal(calls, 3);
  } finally { h.close(); }
});
