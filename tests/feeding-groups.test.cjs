const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./feeding-harness.cjs');

async function setup({ connected = true, list, findById, currentAccount = () => 'a' } = {}) {
  const h = harness({
    '@tanstack/react-query': { useQuery: options => options },
    '@/infrastructure/network/network.service': { networkService: { isConnected: async () => connected } },
    '@/features/auth/stores/auth.store': { useAuthStore: { getState: () => ({ user: { id: currentAccount() } }) } },
    '@/features/animal-groups/services/animal-group.service': { animalGroupService: {
      list: list ?? (async () => ({ data: [{ remoteId: 'rg' }], meta: { totalPages: 1 } })),
      findById: findById ?? (async remoteId => ({ remoteId })),
    } },
  });
  await h.load('src/infrastructure/database/migrations/migrate.ts').migrateDatabase(h.db);
  h.native.exec(`
    INSERT INTO animal_groups(local_id,remote_id,name,animal_count,sync_status,local_created_at,local_updated_at)
      VALUES('g','rg','Grupo',10,'synced','now','now'), ('other','ro','Outro',5,'synced','now','now');
    INSERT INTO feeds(local_id,account_id,name,projected_stock_scaled,sync_status,local_created_at,local_updated_at)
      VALUES('f','a','Soja',10000,'synced','now','now');
  `);
  h.query = h.load('src/features/feeding/hooks/use-feeding-groups.ts').useFeedingGroups('a');
  return h;
}

test('formulário recupera o vínculo do grupo confirmado na API e permite registrar alimentação', async () => {
  const h = await setup();
  try {
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feeding_group_accounts').get().n, 0);
    const groups = await h.query.queryFn();
    assert.equal(groups.length, 1);
    assert.equal(groups[0].localId, 'g');
    const record = await h.load('src/features/feeding/repositories/feeding.repository.ts').feedingRepository.createLocal({
      accountId: 'a', groupLocalId: 'g', feedLocalId: 'f', quantityScaled: 100,
      occurredAt: '2026-11-11T12:00:00Z',
    });
    assert.equal(record.groupLocalId, 'g');
    assert.equal(h.native.prepare("SELECT projected_stock_scaled AS n FROM feeds WHERE local_id='f'").get().n, 9900);
    assert.equal((await h.query.queryFn()).length, 1);
  } finally { h.close(); }
});

test('cadastro verifica o grupo exato e recupera o vínculo antes de salvar a necessidade', async () => {
  const h = await setup();
  try {
    const { ensureFeedingGroup } = h.load('src/features/feeding/services/feeding-sync-context.ts');
    await ensureFeedingGroup('a', 'g');
    const record = await h.load('src/features/feeding/repositories/feed-requirement.repository.ts').feedRequirementRepository.createLocal({
      accountId: 'a', groupLocalId: 'g', feedLocalId: 'f', quantityPerAnimalScaled: 250,
    });
    assert.equal(record.groupLocalId, 'g');
  } finally { h.close(); }
});

test('grupo antigo ausente na API retorna a causa real sem criar vínculo ou necessidade', async () => {
  const h = await setup({ findById: async () => {
    throw { isAxiosError: true, response: { status: 404 } };
  } });
  try {
    const { ensureFeedingGroup } = h.load('src/features/feeding/services/feeding-sync-context.ts');
    await assert.rejects(ensureFeedingGroup('a', 'g'), /salvo no celular, mas não existe/);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feeding_group_accounts').get().n, 0);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feed_requirements').get().n, 0);
  } finally { h.close(); }
});

test('grupos locais já vinculados continuam permitindo necessidade alimentar offline', async () => {
  const h = await setup({ connected: false, findById: () => { throw new Error('Não deve consultar a API'); } });
  try {
    h.native.exec("INSERT INTO feeding_group_accounts VALUES('g','a')");
    const { ensureFeedingGroup } = h.load('src/features/feeding/services/feeding-sync-context.ts');
    await ensureFeedingGroup('a', 'g');
  } finally { h.close(); }
});

test('cadastro usa a rota e o corpo esperados pelo controller Rails', async () => {
  const calls = [];
  const body = { feed_requirement: { feed_id: 'rf', quantity_per_animal_kg: 2.5 } };
  const h = harness({ '@/infrastructure/api': { api: {
    post: async (url, payload) => { calls.push({ url, payload }); return { data: { id: 'requirement' } }; },
  } } });
  try {
    const service = h.load('src/features/feeding/services/feed-requirement.service.ts').feedRequirementService;
    await service.create('rg', body);
    assert.equal(calls[0].url, '/groups/rg/feed_requirements');
    assert.deepEqual(calls[0].payload, body);
  } finally { h.close(); }
});

test('offline mantém grupos já vinculados sem assumir grupos de outra conta', async () => {
  const h = await setup({ connected: false, list: () => { throw new Error('Não deve consultar a API offline'); } });
  try {
    h.native.exec("INSERT INTO feeding_group_accounts VALUES('g','a'), ('other','b')");
    const groups = await h.query.queryFn();
    assert.equal(groups.length, 1);
    assert.equal(groups[0].localId, 'g');
  } finally { h.close(); }
});

test('falha ao verificar grupos sem vínculo retorna erro em vez de lista vazia', async () => {
  const h = await setup({ list: async () => { throw new Error('API indisponível'); } });
  try { await assert.rejects(h.query.queryFn(), /API indisponível/); }
  finally { h.close(); }
});

test('troca de conta durante a resposta não vincula grupos à conta anterior', async () => {
  let account = 'a';
  const h = await setup({ currentAccount: () => account, list: async () => {
    account = 'b';
    return { data: [{ remoteId: 'rg' }], meta: { totalPages: 1 } };
  } });
  try {
    await assert.rejects(h.query.queryFn(), /conta mudou/);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feeding_group_accounts').get().n, 0);
  } finally { h.close(); }
});
