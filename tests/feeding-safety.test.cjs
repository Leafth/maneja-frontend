const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { harness } = require('./feeding-harness.cjs');
const { setup, feeding, requirement } = require('./feeding-repositories.test.cjs');

test('manual entry, feeding and manual exit dispatch in local sequence with one Feeding POST', async () => {
  const calls = []; let stock = 100; let identity = 0;
  const response = () => ({ id: `r${++identity}`, created_at: 'now', updated_at: 'now' });
  const h = await setup({
    './feeding-sync-context': { assertFeedingAccount: () => {} },
    './feed-movement.service': { feedMovementService: {
      createEntry: async (_id, body) => { calls.push('entry'); stock += body.entry.quantity; return response(); },
      createExit: async (_id, body) => { calls.push('exit'); stock -= body.exit.quantity; return response(); },
    } },
    './feeding.service': { feedingService: { create: async (_id, body) => { calls.push('feeding'); stock -= body.feeding.quantity; return response(); } } },
    './feed.service': { feedService: { find: async () => ({ id: 'rf', name: 'Ração', stock_quantity: stock.toFixed(2), created_at: 'now', updated_at: 'now' }) } },
  });
  try {
    await h.movements.createEntryLocal({ accountId: 'a', feedLocalId: 'f', quantityScaled: 1000, valueScaled: 0, occurredOn: '2026-11-11' });
    await h.feedings.createLocal(feeding);
    await h.movements.createExitLocal({ accountId: 'a', feedLocalId: 'f', quantityScaled: 500, reason: 'Perda', occurredOn: '2026-11-11' });
    assert.equal(h.stock(), 8000);
    const sync = h.load('src/features/feeding/services/feed-stock-sync.service.ts').feedStockSyncService;
    await sync.sync('a'); await sync.sync('a');
    assert.deepEqual(calls, ['entry', 'feeding', 'exit']);
    assert.equal(h.stock(), 8000);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feed_movements').get().n, 2);
  } finally { h.close(); }
});

test('concurrent feeding reservations cannot overspend; rename and pull preserve queued delta', async () => {
  const h = await setup();
  try {
    const results = await Promise.allSettled([h.feedings.createLocal({ ...feeding, quantityScaled: 7000 }), h.feedings.createLocal({ ...feeding, quantityScaled: 7000 })]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal(h.stock(), 3000);
    const feeds = h.load('src/features/feeding/repositories/feed.repository.ts').feedRepository;
    await Promise.all([
      feeds.renameLocal('a', 'f', 'Novo nome'),
      feeds.mergeRemoteSnapshot('a', { remoteId: 'rf', name: 'Antigo', remoteStockScaled: 3000, remoteCreatedAt: 'now', remoteUpdatedAt: 'now' }),
    ]);
    assert.equal(h.stock(), 3000);
    assert.equal((await feeds.findByLocalId('a', 'f')).name, 'Novo nome');
    await assert.rejects(feeds.markPendingDelete('a', 'f'), /pendentes/);
    await assert.rejects(h.db.runAsync("UPDATE animal_groups SET sync_status='pending_delete' WHERE local_id='g'"), /pendentes/);
  } finally { h.close(); }
});

test('SQLite survives reopening with pending requirements, feeding, history and projected stock', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'maneja-feeding-'));
  const filename = path.join(directory, 'test.db');
  let h = await setup(undefined, filename);
  try {
    await h.requirements.createLocal(requirement);
    const record = await h.feedings.createLocal(feeding);
    await h.feedings.markSending('a', record.localId);
    h.close();
    h = harness({}, filename);
    const repository = h.load('src/features/feeding/repositories/feeding.repository.ts').feedingRepository;
    await repository.recoverInterrupted('a');
    assert.equal((await repository.findByGroupLocalId('a', 'g'))[0].dispatchState, 'uncertain');
    assert.equal(h.native.prepare('SELECT projected_stock_scaled AS n FROM feeds').get().n, 7500);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feed_requirements').get().n, 1);
  } finally {
    h.close(); fs.unlinkSync(filename); fs.rmdirSync(directory);
  }
});

test('account FK prevents cross-account dependencies and legacy groups are not silently claimed', async () => {
  const h = await setup();
  try {
    h.native.exec("INSERT INTO animal_groups(local_id,name,animal_count,sync_status,local_created_at,local_updated_at) VALUES('legacy','Legado',2,'pending_create','now','now')");
    await assert.rejects(h.requirements.createLocal({ ...requirement, groupLocalId: 'legacy' }), /vínculo/);
    await assert.rejects(h.feedings.createLocal({ ...feeding, accountId: 'another' }), /conta/);
    const groups = h.load('src/features/feeding/repositories/feeding-group.repository.ts').feedingGroupRepository;
    await groups.bindVerifiedRemote('another', 'rg');
    assert.equal((await groups.list('another')).length, 0);
  } finally { h.close(); }
});
