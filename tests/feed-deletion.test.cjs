/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { harness } = require('./feeding-harness.cjs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };

  vm.runInNewContext(outputText, {
    module,
    exports: module.exports,
    require: (id) => {
      assert.ok(Object.hasOwn(dependencies, id), `Dependência inesperada: ${id}`);
      return dependencies[id];
    },
  }, { filename: file });

  return module.exports;
}

test('exclusão persiste após sincronizar e respostas antigas não reativam a ração', async () => {
  const h = harness();
  const database = h.native;
  const adapter = h.db;

  try {
    const migrations = h.load('src/infrastructure/database/migrations/migrate.ts');
    await migrations.migrateDatabase(adapter);
    assert.equal(database.prepare('PRAGMA user_version').get().user_version, 10);
    const repository = h.load('src/features/feeding/repositories/feed.repository.ts').feedRepository;

    const remoteFeed = await repository.createLocal({ accountId: 'conta', name: 'Soja', initialStockScaled: 18000 });
    await repository.assignRemoteIdentity('conta', remoteFeed.localId, {
      remoteId: 'remote-1', name: 'Soja', remoteStockScaled: 18000,
      remoteCreatedAt: '2026-10-30T10:00:00Z', remoteUpdatedAt: '2026-10-30T10:00:00Z',
    }, remoteFeed.localUpdatedAt);
    await repository.markPendingDelete('conta', remoteFeed.localId);
    assert.equal((await repository.findByLocalId('conta', remoteFeed.localId)).syncStatus, 'pending_delete');
    await repository.confirmRemoteDelete('conta', remoteFeed.localId);
    const deleted = await repository.findByLocalId('conta', remoteFeed.localId);
    assert.equal(deleted.syncStatus, 'synced');
    assert.ok(deleted.locallyDeletedAt);
    assert.deepEqual(await repository.findPending('conta'), []);
    await repository.mergeRemoteSnapshot('conta', {
      remoteId: 'remote-1', name: 'Soja', remoteStockScaled: 18000,
      remoteCreatedAt: '2026-10-30T10:00:00Z', remoteUpdatedAt: '2026-10-30T10:00:00Z',
    });
    assert.ok((await repository.findByLocalId('conta', remoteFeed.localId)).locallyDeletedAt);

    const pendingCreate = await repository.createLocal({ accountId: 'conta', name: 'Milho', initialStockScaled: 5000 });
    await repository.markPendingDelete('conta', pendingCreate.localId);
    await repository.assignRemoteIdentity('conta', pendingCreate.localId, {
      remoteId: 'remote-2', name: 'Milho', remoteStockScaled: 5000,
      remoteCreatedAt: '2026-10-30T10:00:00Z', remoteUpdatedAt: '2026-10-30T10:00:00Z',
    }, pendingCreate.localUpdatedAt);
    const stillDeleting = await repository.findByLocalId('conta', pendingCreate.localId);
    assert.equal(stillDeleting.remoteId, 'remote-2');
    assert.equal(stillDeleting.syncStatus, 'pending_delete');

    const visibleFeed = await repository.createLocal({ accountId: 'conta', name: 'Farelo', initialStockScaled: 1000 });
    const useFeeds = load('src/features/feeding/hooks/use-feeds.ts', {
      '@tanstack/react-query': { useQuery: (options) => options },
      '../repositories/feed.repository': { feedRepository: repository },
      './feed-query-keys': { feedQueryKeys: { list: () => [], lists: () => [] } },
    }).useFeeds;
    const visible = await useFeeds('conta').queryFn();
    assert.deepEqual(visible.map((feed) => feed.localId), [visibleFeed.localId]);
  } finally {
    database.close();
  }
});
