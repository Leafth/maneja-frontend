const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./feeding-harness.cjs');

async function setup() {
  let requirements = [];
  const h = harness({
    react: { useState: value => [value, () => {}] },
    'expo-router': { useLocalSearchParams: () => ({ localId: 'g' }), useRouter: () => ({}) },
    'react-hook-form': { useForm: () => ({ handleSubmit: fn => fn }) },
    '@/features/animal-groups/hooks': { useAnimalGroup: () => ({ data: { animalCount: 10 } }) },
    '../hooks/use-save-feed-requirement': { useSaveFeedRequirement: () => ({}) },
    '../hooks/use-delete-feed-requirement': { useDeleteFeedRequirement: () => ({}) },
    './use-feeding-account': { useFeedingAccount: () => ({ accountId: 'a' }) },
    './use-feed-requirements': { useFeedRequirements: () => ({ data: requirements }) },
    './use-feeds': { useFeeds: () => ({ data: [{ localId: 'f', name: 'Soja' }] }) },
  });
  await h.load('src/infrastructure/database/migrations/migrate.ts').migrateDatabase(h.db);
  h.native.exec(`
    INSERT INTO animal_groups(local_id,remote_id,name,animal_count,sync_status,local_created_at,local_updated_at)
      VALUES('g','rg','Grupo',10,'synced','now','now');
    INSERT INTO feeding_group_accounts VALUES('g','a');
    INSERT INTO feeds(local_id,account_id,remote_id,name,remote_stock_scaled,projected_stock_scaled,sync_status,local_created_at,local_updated_at)
      VALUES('f','a','rf','Soja',10000,10000,'synced','now','now');
  `);
  h.repository = h.load('src/features/feeding/repositories/feed-requirement.repository.ts').feedRequirementRepository;
  const viewModel = h.load('src/features/feeding/viewmodels/use-feed-requirement-view-model.ts').useFeedRequirementViewModel;
  h.render = async () => {
    requirements = await h.repository.findByGroupLocalId('a', 'g', true);
    return viewModel();
  };
  return h;
}

const input = { accountId: 'a', groupLocalId: 'g', feedLocalId: 'f', quantityPerAnimalScaled: 100 };
const remote = { id: 'rr', feed_id: 'rf', quantity_per_animal_kg: '1', created_at: 'now', updated_at: 'now' };

test('deleted feed becomes selectable immediately and can be registered again before synchronization', async () => {
  const h = await setup();
  try {
    await h.repository.reconcileRemoteList('a', 'g', [remote]);
    assert.equal((await h.render()).feedOptions.length, 0);
    const [current] = await h.repository.findByGroupLocalId('a', 'g');
    await h.repository.markPendingDelete('a', current.localId);
    const vm = await h.render();
    assert.equal(vm.items.length, 0);
    assert.equal(vm.feedOptions[0].value, 'f');
    const restored = await h.repository.createLocal({ ...input, quantityPerAnimalScaled: 250 });
    assert.equal(restored.localId, current.localId);
    assert.equal(restored.remoteId, 'rr');
    assert.equal(restored.syncStatus, 'pending_update');
    assert.equal(restored.locallyDeletedAt, null);
    assert.equal((await h.render()).feedOptions.length, 0);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feed_requirements').get().n, 1);
    assert.equal((await h.repository.findByLocalId('a', current.localId)).quantityPerAnimalScaled, 250);
  } finally { h.close(); }
});

test('local deletion and confirmed remote deletion both allow a fresh registration', async () => {
  const h = await setup();
  try {
    const first = await h.repository.createLocal(input);
    await h.repository.markPendingDelete('a', first.localId);
    assert.equal((await h.render()).feedOptions.length, 1);
    await h.repository.reconcileRemoteList('a', 'g', [remote]);
    const [synced] = await h.repository.findByGroupLocalId('a', 'g');
    await h.repository.markPendingDelete('a', synced.localId);
    await h.repository.confirmDelete('a', synced.localId);
    const fresh = await h.repository.createLocal(input);
    assert.equal(fresh.syncStatus, 'pending_create');
    assert.equal(fresh.remoteId, null);
  } finally { h.close(); }
});

test('registration cannot undo an in-flight or uncertain deletion', async () => {
  const h = await setup();
  try {
    await h.repository.reconcileRemoteList('a', 'g', [remote]);
    const [current] = await h.repository.findByGroupLocalId('a', 'g');
    await h.repository.markPendingDelete('a', current.localId);
    for (const state of ['sending', 'uncertain', 'conflict']) {
      await h.repository.markState('a', current.localId, state);
      await assert.rejects(h.repository.createLocal(input), /confirma/);
      assert.equal((await h.repository.findByLocalId('a', current.localId)).syncStatus, 'pending_delete');
    }
  } finally { h.close(); }
});
