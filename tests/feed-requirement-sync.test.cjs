const test = require('node:test');
const assert = require('node:assert/strict');
const { setup, requirement } = require('./feeding-repositories.test.cjs');

for (const mode of ['success', 'timeout-match', 'timeout-conflict', 'timeout-absent']) {
  test(`requirement sync ${mode}`, async () => {
    let creates = 0; let updates = 0; let deletes = 0;
    const dto = { id: 'rr', feed_id: 'rf', quantity_per_animal_kg: '2.5', created_at: 'now', updated_at: 'now' };
    const h = await setup({
      './feeding-sync-context': { assertFeedingAccount: () => {} },
      './feed-requirement.service': { feedRequirementService: {
        create: async () => { creates++; if (mode !== 'success') throw new Error('timeout'); return dto; },
        update: async (_group, _id, body) => { updates++; assert.equal(body.feed_requirement.feed_id, 'rf'); return dto; },
        remove: async () => { deletes++; },
        list: async () => ({ group_id: 'rg', feed_requirements: mode === 'timeout-absent' ? [] : [{ ...dto, quantity_per_animal_kg: mode === 'timeout-conflict' ? '3.0' : '2.5' }] }),
      } },
    });
    try {
      const record = await h.requirements.createLocal(requirement);
      const sync = h.load('src/features/feeding/services/feed-requirement-sync.service.ts').feedRequirementSyncService;
      await sync.sync('a'); await sync.sync('a');
      assert.equal(creates, 1);
      const current = await h.requirements.findByLocalId('a', record.localId);
      if (mode === 'success' || mode === 'timeout-match') {
        assert.equal(current.syncStatus, 'synced');
        await h.requirements.updateLocal('a', current.localId, { feedLocalId: 'f', quantityPerAnimalScaled: 500 });
        await sync.sync('a'); assert.equal(updates, 1);
        await h.requirements.markPendingDelete('a', current.localId);
        await sync.sync('a'); assert.equal(deletes, 1);
      } else assert.equal(current.dispatchState, mode === 'timeout-conflict' ? 'conflict' : 'uncertain');
    } finally { h.close(); }
  });
}
