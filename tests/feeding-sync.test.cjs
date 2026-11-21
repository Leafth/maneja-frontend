const test = require('node:test');
const assert = require('node:assert/strict');
const { setup, feeding } = require('./feeding-repositories.test.cjs');

for (const mode of ['201', '422', '401', 'timeout', '500', 'snapshot-fails']) {
  test(`feeding sync ${mode}: no duplicate POST or stock deduction`, async () => {
    let posts = 0; let failSnapshot = mode === 'snapshot-fails';
    const h = await setup({
      './feeding-sync-context': { assertFeedingAccount: () => {} },
      './feeding.service': { feedingService: { create: async () => {
        posts++;
        if (['422', '401', '500'].includes(mode)) throw { isAxiosError: true, response: { status: Number(mode) } };
        if (mode === 'timeout') throw new Error('timeout');
        return { id: 'remote-feeding', created_at: 'now', updated_at: 'now' };
      } } },
      './feed.service': { feedService: { find: async () => {
        if (failSnapshot) throw new Error('snapshot timeout');
        return { id: 'rf', name: 'Ração', stock_quantity: '75.0', created_at: 'now', updated_at: 'now' };
      } } },
    });
    try {
      const record = await h.feedings.createLocal(feeding);
      const sync = h.load('src/features/feeding/services/feed-stock-sync.service.ts').feedStockSyncService;
      if (mode === '401') await assert.rejects(sync.sync('a')); else await sync.sync('a');
      const current = await h.feedings.findByLocalId('a', record.localId);
      assert.equal(current.dispatchState, ({ '201': 'confirmed', '422': 'rejected', '401': 'queued', timeout: 'uncertain', '500': 'uncertain', 'snapshot-fails': 'confirmed' })[mode]);
      assert.equal(h.stock(), mode === '422' ? 10000 : 7500);
      if (mode !== '401') {
        // A final pull cannot incorporate confirmed/uncertain local reservations twice.
        await h.load('src/features/feeding/repositories/feed.repository.ts').feedRepository.mergeRemoteSnapshot('a', {
          remoteId: 'rf', name: 'Ração', remoteStockScaled: 7500, remoteCreatedAt: 'now', remoteUpdatedAt: 'now',
        });
        if (mode !== '422') assert.equal(h.stock(), 7500);
        failSnapshot = false;
        await sync.sync('a');
        assert.equal(posts, 1);
        if (mode === '201' || mode === 'snapshot-fails') {
          assert.equal(h.stock(), 7500);
          assert.equal((await h.feedings.findByLocalId('a', record.localId)).balanceState, 'incorporated');
        }
      }
    } finally { h.close(); }
  });
}

test('remote history traverses all pages and only deduplicates by remote id', async () => {
  const pages = [];
  const h = await setup({
    './feeding-sync-context': { assertFeedingAccount: () => {} },
    './feeding.service': { feedingService: { list: async (_group, page, perPage) => {
      pages.push(page); assert.equal(perPage, 100);
      return { group_id: 'rg', data: [{ id: String(page), feed_id: 'rf', quantity: '25.0', occurred_at: feeding.occurredAt, created_at: 'now', updated_at: 'now' }], meta: { page, total_pages: 3 } };
    } } },
  });
  try {
    await h.feedings.createLocal(feeding);
    const sync = h.load('src/features/feeding/services/feeding-sync.service.ts').feedingSyncService;
    await sync.pull('a'); await sync.pull('a');
    assert.deepEqual(pages, [1, 2, 3, 1, 2, 3]);
    assert.equal((await h.feedings.findByGroupLocalId('a', 'g')).length, 4);
  } finally { h.close(); }
});
