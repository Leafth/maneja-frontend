const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./feeding-harness.cjs');

async function setup(overrides, filename) {
  const h = harness(overrides, filename);
  await h.load('src/infrastructure/database/migrations/migrate.ts').migrateDatabase(h.db);
  h.native.exec(`INSERT INTO animal_groups(local_id, remote_id, name,animal_count,sync_status,local_created_at,local_updated_at) VALUES('g','rg','Grupo',10,'synced','now','now');
    INSERT INTO feeding_group_accounts VALUES('g','a');
    INSERT INTO feeds(local_id,account_id,remote_id,name,remote_stock_scaled,projected_stock_scaled,sync_status,local_created_at,local_updated_at) VALUES('f','a','rf','Ração',10000,10000,'synced','now','now');`);
  h.requirements = h.load('src/features/feeding/repositories/feed-requirement.repository.ts').feedRequirementRepository;
  h.feedings = h.load('src/features/feeding/repositories/feeding.repository.ts').feedingRepository;
  h.movements = h.load('src/features/feeding/repositories/feed-movement.repository.ts').feedMovementRepository;
  h.stock = () => h.native.prepare("SELECT projected_stock_scaled AS n FROM feeds WHERE local_id='f'").get().n;
  return h;
}
const requirement = { accountId: 'a', groupLocalId: 'g', feedLocalId: 'f', quantityPerAnimalScaled: 250 };
const feeding = { accountId: 'a', groupLocalId: 'g', feedLocalId: 'f', quantityScaled: 2500, occurredAt: '2026-11-11T15:30:00Z' };

test('requirement local create, uniqueness, edit, cancellation, tombstone and pull preservation', async () => {
  const h = await setup();
  try {
    const r = await h.requirements.createLocal(requirement);
    await assert.rejects(h.requirements.createLocal(requirement), /já possui/);
    await h.requirements.updateLocal('a', r.localId, { feedLocalId: 'f', quantityPerAnimalScaled: 300 });
    assert.equal((await h.requirements.findByLocalId('a', r.localId)).syncStatus, 'pending_create');
    await h.requirements.cancelLocalCreate('a', r.localId);
    assert.equal(await h.requirements.findByLocalId('a', r.localId), null);
    const remote = { id: 'rr', feed_id: 'rf', quantity_per_animal_kg: '2.5', created_at: 'now', updated_at: 'now' };
    await h.requirements.reconcileRemoteList('a', 'g', [remote]);
    const [imported] = await h.requirements.findByGroupLocalId('a', 'g');
    await h.requirements.updateLocal('a', imported.localId, { feedLocalId: 'f', quantityPerAnimalScaled: 400 });
    await h.requirements.reconcileRemoteList('a', 'g', [remote]);
    assert.equal((await h.requirements.findByLocalId('a', imported.localId)).quantityPerAnimalScaled, 400);
    await h.requirements.markPendingDelete('a', imported.localId);
    await h.requirements.reconcileRemoteList('a', 'g', []);
    assert.equal((await h.requirements.findByLocalId('a', imported.localId)).syncStatus, 'pending_delete');
    assert.equal((await h.requirements.findByGroupLocalId('a', 'g')).length, 0);
  } finally { h.close(); }
});

test('feeding transaction reserves stock, accepts exact balance and rolls back insufficient/account errors', async () => {
  const h = await setup();
  try {
    await assert.rejects(h.feedings.createLocal({ ...feeding, quantityScaled: 10001 }), /insuficiente/);
    await assert.rejects(h.feedings.createLocal({ ...feeding, accountId: 'other' }), /conta/);
    const r = await h.feedings.createLocal({ ...feeding, quantityScaled: 10000 });
    assert.equal(h.stock(), 0);
    assert.equal((await h.feedings.findByGroupLocalId('a', 'g')).length, 1);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feed_movements').get().n, 0);
    await h.feedings.markState('a', r.localId, 'rejected', 'Insuficiente', 422);
    await h.feedings.markState('a', r.localId, 'rejected', 'Insuficiente', 422);
    assert.equal(h.stock(), 10000);
    assert.equal((await h.feedings.findByLocalId('a', r.localId)).balanceState, 'released');
  } finally { h.close(); }
});

test('feeding and manual stock share order; interrupted sends remain uncertain; remote identity alone deduplicates', async () => {
  const h = await setup();
  try {
    const a = await h.feedings.createLocal(feeding);
    const b = await h.movements.createEntryLocal({ accountId: 'a', feedLocalId: 'f', quantityScaled: 100, valueScaled: 0, occurredOn: '2026-11-11' });
    const c = await h.feedings.createLocal(feeding);
    assert.ok(a.sequenceNumber < b.sequenceNumber && b.sequenceNumber < c.sequenceNumber);
    await h.feedings.markSending('a', a.localId);
    await h.feedings.recoverInterrupted('a');
    assert.equal((await h.feedings.findByLocalId('a', a.localId)).dispatchState, 'uncertain');
    const dto = { id: 'one', feed_id: 'rf', quantity: '25.0', occurred_at: feeding.occurredAt, created_at: 'now', updated_at: 'now' };
    await h.feedings.importRemote('a', 'g', [dto, dto, { ...dto, id: 'two' }]);
    assert.equal((await h.feedings.findByGroupLocalId('a', 'g')).length, 4);
    assert.equal((await h.feedings.findByGroupLocalId('other', 'g')).length, 0);
  } finally { h.close(); }
});
module.exports = { setup, feeding, requirement };
