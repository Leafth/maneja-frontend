const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./feeding-harness.cjs');

async function setup(status = 204) {
  const calls = [];
  const service = entity => ({ remove: async id => {
    calls.push([entity, id]);
    if (status !== 204) throw { isAxiosError: true, response: { status } };
  } });
  const h = harness({
    './animal-group.service': { animalGroupService: service('group') },
    './terrain.service': { terrainService: service('terrain') },
  });
  await h.load('src/infrastructure/database/migrations/migrate.ts').migrateDatabase(h.db);
  h.native.exec(`
    INSERT INTO animal_groups(local_id,remote_id,name,animal_count,sync_status,local_created_at,local_updated_at)
      VALUES('g','rg','Grupo',10,'synced','now','now');
    INSERT INTO terrains(local_id,remote_id,name,rest_days,status,sync_status,local_created_at,local_updated_at)
      VALUES('t','rt','Terreno',2,'available','synced','now','now');
    INSERT INTO movement_commands(local_id,account_id,group_local_id,destination_terrain_local_id,sequence_number,sync_status,dispatch_state,local_created_at,local_updated_at)
      VALUES('m','a','g','t',1,'synced','confirmed','now','now');
  `);
  return Object.assign(h, {
    calls,
    groups: h.load('src/features/animal-groups/repositories/animal-group.repository.ts').animalGroupRepository,
    terrains: h.load('src/features/terrains/repositories/terrain.repository.ts').terrainRepository,
    groupSync: h.load('src/features/animal-groups/services/animal-group-sync.service.ts').animalGroupSyncService,
    terrainSync: h.load('src/features/terrains/services/terrain-sync.service.ts').terrainSyncService,
  });
}

for (const status of [204, 404]) test(`DELETE ${status} preserves history and stops retrying both parents`, async () => {
  const h = await setup(status);
  try {
    await h.groups.remove('g'); await h.terrains.remove('t');
    await h.groupSync.pushPending(); await h.terrainSync.push();
    assert.equal((await h.groups.findPending()).length, 0);
    assert.equal((await h.terrains.findPending()).length, 0);
    await h.groups.upsertFromRemote({ remoteId: 'rg', name: 'Old', animalCount: 10 });
    await h.terrains.upsertFromRemote({ remoteId: 'rt', name: 'Old', restDays: 2, status: 'available' });
    assert.equal((await h.groups.findAll()).length, 0);
    assert.equal((await h.terrains.findAll()).length, 0);
    assert.equal(await h.groups.findById('g'), null);
    assert.equal(await h.terrains.findByLocalId('t'), null);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM movement_commands').get().n, 1);
    assert.equal(h.native.prepare('PRAGMA foreign_key_check').all().length, 0);
    await h.groupSync.pushPending(); await h.terrainSync.push();
    assert.equal(h.calls.length, 2);
  } finally { h.close(); }
});

test('pending movements and occupied terrains still prevent deletion', async () => {
  const h = await setup();
  try {
    h.native.exec("UPDATE movement_commands SET dispatch_state='uncertain', sync_status='pending_create'");
    await assert.rejects(h.groups.remove('g'), /pendentes/);
    await assert.rejects(h.terrains.remove('t'), /pendentes/);
    h.native.exec("UPDATE movement_commands SET dispatch_state='confirmed', sync_status='synced'; UPDATE terrains SET status='occupied'");
    await assert.rejects(h.terrains.remove('t'), /animais/);
    await h.groups.remove('g');
  } finally { h.close(); }
});

test('synced feeding history allows deletion but pending requirements block it', async () => {
  const h = await setup();
  try {
    h.native.exec(`
      INSERT INTO feeding_group_accounts VALUES('g','a');
      INSERT INTO feeds(local_id,account_id,remote_id,name,remote_stock_scaled,projected_stock_scaled,sync_status,local_created_at,local_updated_at)
        VALUES('f','a','rf','Feed',10000,10000,'synced','now','now');
      INSERT INTO feed_requirements(local_id,account_id,group_local_id,feed_local_id,quantity_per_animal_scaled,sync_status,dispatch_state,local_created_at,local_updated_at)
        VALUES('r','a','g','f',100,'pending_create','idle','now','now');
      INSERT INTO feeding_records(local_id,account_id,group_local_id,feed_local_id,quantity_scaled,occurred_at,sequence_number,sync_status,dispatch_state,balance_state,local_created_at,local_updated_at)
        VALUES('feeding','a','g','f',100,'now',1,'synced','confirmed','incorporated','now','now');
    `);
    await assert.rejects(h.groups.remove('g'), /pendentes/);
    h.native.exec("UPDATE feed_requirements SET sync_status='synced'");
    await h.groups.remove('g');
    await h.groupSync.pushPending();
    assert.equal((await h.groups.findPending()).length, 0);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feeding_records').get().n, 1);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feed_requirements').get().n, 1);
    const groups = h.load('src/features/feeding/repositories/feeding-group.repository.ts').feedingGroupRepository;
    assert.equal((await groups.list('a')).length, 0);
  } finally { h.close(); }
});

test('late create response preserves requested deletion and its remote identity', async () => {
  const h = await setup();
  try {
    const group = await h.groups.create({ name: 'Novo', animalCount: 1 });
    const terrain = await h.terrains.create({ name: 'Novo', restDays: 1 });
    await h.groups.remove(group.localId); await h.terrains.remove(terrain.localId);
    await h.groups.markAsSynced(group.localId, { remoteId: 'new-g', name: 'Novo', animalCount: 1,
      currentTerrainRemoteId: null, currentTerrainName: null, remoteCreatedAt: 'now', remoteUpdatedAt: 'now' });
    await h.terrains.markAsSynced(terrain.localId, { remoteId: 'new-t', name: 'Novo', restDays: 1,
      status: 'available', remoteCreatedAt: 'now', remoteUpdatedAt: 'now' });
    assert.equal((await h.groups.findById(group.localId)).syncStatus, 'pending_delete');
    assert.equal((await h.terrains.findByLocalId(terrain.localId)).syncStatus, 'pending_delete');
    await h.groupSync.pushPending(); await h.terrainSync.push();
    assert.deepEqual(h.calls, [['group', 'new-g'], ['terrain', 'new-t']]);
  } finally { h.close(); }
});
