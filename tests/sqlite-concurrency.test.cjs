/* global __dirname */
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const databaseFile = 'src/infrastructure/database/database.ts';
const syncFile = 'src/infrastructure/sync/sync-orchestrator.ts';
const localFile = 'src/features/animal-groups/data-sources/animal-group.local-data-source.ts';
const repositoryFile = 'src/features/animal-groups/repositories/animal-group.repository.ts';
const tick = () => new Promise((resolve) => setImmediate(resolve));

// Execute the real TypeScript modules with isolated runtime/native dependencies.
// Reloading a module with the same runtime simulates Fast Refresh.
function load(file, dependencies, runtime = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    globalThis: runtime,
    module,
    exports: module.exports,
    require: (id) => {
      assert.ok(Object.hasOwn(dependencies, id), `Unexpected dependency: ${id}`);
      return dependencies[id];
    },
    console: { error: () => {} },
  }, { filename: file });
  return module.exports;
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function databaseModule(openDatabaseAsync, migrateDatabase, runtime = {}) {
  return load(databaseFile, {
    'expo-sqlite': { openDatabaseAsync },
    './migrations/migrate': { migrateDatabase },
  }, runtime);
}

test('one initialization waits for open, PRAGMAs and migrations, including module reload', async () => {
  const opened = deferred();
  const pragmas = deferred();
  const migrated = deferred();
  const runtime = {};
  let opens = 0;
  let migrations = 0;
  let published = false;
  const handle = { execAsync: () => pragmas.promise };
  const open = () => { opens++; return opened.promise; };
  const migrate = async (db) => {
    assert.equal(db, handle);
    migrations++;
    await migrated.promise;
  };
  const first = databaseModule(open, migrate, runtime);
  const promise = first.getDatabase();
  assert.equal(first.getDatabase(), promise);
  const reloaded = databaseModule(open, migrate, runtime);
  assert.equal(reloaded.getDatabase(), promise);
  promise.then(() => { published = true; });
  await tick();
  assert.equal(opens, 1);
  opened.resolve(handle);
  await tick();
  assert.equal(migrations, 0);
  assert.equal(published, false);
  pragmas.resolve();
  await tick();
  assert.equal(migrations, 1);
  assert.equal(published, false);
  migrated.resolve();
  assert.equal(await promise, handle);
  assert.equal(await reloaded.getDatabase(), handle);
  assert.equal(opens, 1);
});

for (const stage of ['open', 'pragmas', 'migration']) {
  test(`initialization failure at ${stage} allows retry after private handle cleanup`, async () => {
    const failure = new Error(stage);
    const closing = deferred();
    let attempt = 0;
    let closes = 0;
    const handle = {
      execAsync: async () => {
        if (stage === 'pragmas' && attempt === 1) {
          throw failure;
        }
      },
      closeAsync: async () => { closes++; await closing.promise; },
    };
    const db = databaseModule(async () => {
      attempt++;
      if (stage === 'open' && attempt === 1) {
        throw failure;
      }
      return handle;
    }, async () => {
      if (stage === 'migration' && attempt === 1) {
        throw failure;
      }
    });
    const first = db.getDatabase();
    const rejection = assert.rejects(first, (error) => error === failure);
    if (stage !== 'open') {
      await tick();
      assert.equal(db.getDatabase(), first);
      assert.equal(attempt, 1);
      closing.resolve();
    }
    await rejection;
    assert.equal(await db.getDatabase(), handle);
    assert.equal(attempt, 2);
    assert.equal(closes, stage === 'open' ? 0 : 1);
  });
}

test('FIFO survives rejection and reload, waiting for the entire operation', async () => {
  const runtime = {};
  const gate = deferred();
  const order = [];
  const handle = { execAsync: async () => {} };
  const open = async () => handle;
  const migrate = async () => {};
  const first = databaseModule(open, migrate, runtime);
  const a = first.withDatabase(async () => {
    order.push('A starts');
    await gate.promise;
    order.push('A finalized');
  });
  await tick();
  const reloaded = databaseModule(open, migrate, runtime);
  const b = reloaded.withDatabase(async () => {
    order.push('B');
    throw new Error('SQL failed');
  });
  const rejection = assert.rejects(b, /SQL failed/);
  const c = first.withDatabase(async () => { order.push('C'); return 42; });
  await tick();
  assert.deepEqual(order, ['A starts']);
  gate.resolve();
  await a;
  await rejection;
  assert.equal(await c, 42);
  assert.deepEqual(order, ['A starts', 'A finalized', 'B', 'C']);
});

test('real migrations and all LocalDataSource operations share one connection under CRUD load', async () => {
  const native = new DatabaseSync(':memory:');
  let active = 0;
  let peak = 0;
  let opens = 0;
  let closes = 0;
  async function sql(work) {
    active++;
    peak = Math.max(peak, active);
    try {
      await tick();
      return work();
    } finally {
      // Model the asynchronous statement finalization done by expo-sqlite.
      await tick();
      active--;
    }
  }
  const handle = {
    execAsync: (query) => sql(() => native.exec(query)),
    getAllAsync: (query, args = []) => sql(() => native.prepare(query).all(...args)),
    getFirstAsync: (query, args = []) => sql(() => native.prepare(query).get(...args) ?? null),
    runAsync: (query, args = []) => sql(() => native.prepare(query).run(...args)),
    closeAsync: async () => { closes++; },
    withTransactionAsync: async (work) => {
      await handle.execAsync('BEGIN');
      try {
        await work();
        await handle.execAsync('COMMIT');
      } catch (error) {
        await handle.execAsync('ROLLBACK');
        throw error;
      }
    },
  };
  const migration = load('src/infrastructure/database/migrations/migrate.ts', {
    './001-create-animal-groups': load('src/infrastructure/database/migrations/001-create-animal-groups.ts', {}),
  });
  const runtime = {};
  const open = async () => { opens++; return handle; };
  const db = databaseModule(open, migration.migrateDatabase, runtime);
  const { animalGroupLocalDataSource: local } = load(localFile, {
    '@/infrastructure/database/database': db,
  });
  const { animalGroupRepository: repo } = load(repositoryFile, {
    'expo-crypto': { randomUUID },
    '../data-sources/animal-group.local-data-source': { animalGroupLocalDataSource: local },
  });
  try {
    await Promise.all([local.findAll(), local.findPending(), db.getDatabase()]);
    const groups = await Promise.all(Array.from({ length: 40 }, (_, i) =>
      repo.create({ name: `Grupo ${i}`, animalCount: i + 1 }),
    ));
    await Promise.all(groups.map(async (group, i) => {
      await Promise.all([local.findAll(), local.findPending(), local.findByLocalId(group.localId)]);
      await repo.update(group.localId, { name: 'Editado', animalCount: 10 });
      assert.equal((await repo.findById(group.localId)).syncStatus, 'pending_create');
      await local.setSyncError(group.localId, 'Test');
      if (i % 2 === 0) {
        const remote = {
          remoteId: `remote-${i}`, name: 'Remoto', animalCount: 11,
          remoteCreatedAt: '2026-10-06', remoteUpdatedAt: '2026-10-06',
        };
        await local.markAsSynced(group.localId, remote);
        assert.equal((await local.findByRemoteId(remote.remoteId)).localId, group.localId);
        await repo.upsertFromRemote({ ...remote, name: 'Pull' });
      }
      await repo.remove(group.localId);
    }));
    assert.equal((await local.findAll()).length, 0);
    const pending = await local.findPending();
    assert.equal(pending.length, 20);
    assert.ok(pending.every((group) => group.syncStatus === 'pending_delete'));
    await Promise.all(pending.map((group) => local.deleteByLocalId(group.localId)));
    assert.equal((await local.findPending()).length, 0);
    const reloaded = databaseModule(open, migration.migrateDatabase, runtime);
    assert.equal(await reloaded.getDatabase(), handle);
    assert.equal(opens, 1);
    assert.equal(closes, 0);
    assert.equal(peak, 1);
    assert.equal(native.prepare('PRAGMA user_version').get().user_version, 1);
  } finally {
    native.close();
  }
});

function syncModule(isConnected, sync, emit = () => {}, runtime = {}) {
  return load(syncFile, {
    '@/features/animal-groups/services/animal-group-sync.service': { animalGroupSyncService: { sync } },
    '../network/network.service': { networkService: { isConnected } },
    './sync-events': { syncEvents: { emit } },
  }, runtime).syncOrchestrator;
}

test('sync locks before network check and coalesces requests during active rounds', async () => {
  const network = deferred();
  const firstRound = deferred();
  const secondRound = deferred();
  const runtime = {};
  let checks = 0;
  let rounds = 0;
  let active = 0;
  let peak = 0;
  let events = 0;
  const connected = async () => { checks++; return network.promise; };
  const work = async () => {
    const round = ++rounds;
    active++;
    peak = Math.max(peak, active);
    if (round === 1) {
      await firstRound.promise;
    }
    if (round === 2) {
      await secondRound.promise;
    }
    active--;
  };
  const emit = () => { events++; };
  const sync = syncModule(connected, work, emit, runtime);
  const first = sync.sync();
  await tick();
  const reloaded = syncModule(connected, work, emit, runtime);
  assert.equal(reloaded.sync(), first);
  assert.equal(checks, 1);
  network.resolve(true);
  await tick();
  assert.equal(rounds, 1);
  for (let i = 0; i < 20; i++) {
    assert.equal(sync.sync(), first);
  }
  firstRound.resolve();
  await tick();
  assert.equal(rounds, 2);
  // A new write after round two took its snapshot needs a third round.
  assert.equal(sync.sync(), first);
  secondRound.resolve();
  await first;
  assert.equal(rounds, 3);
  assert.equal(events, 3);
  assert.equal(peak, 1);
  await reloaded.sync();
  assert.equal(rounds, 4);
});

for (const mode of ['offline', 'network error', 'sync error']) {
  test(`${mode} releases the sync guard without an automatic retry loop`, async () => {
    let failing = true;
    let checks = 0;
    let rounds = 0;
    const sync = syncModule(async () => {
      checks++;
      if (failing && mode === 'network error') {
        throw new Error(mode);
      }
      return !(failing && mode === 'offline');
    }, async () => {
      rounds++;
      if (failing && mode === 'sync error') {
        throw new Error(mode);
      }
    });
    await sync.sync();
    assert.equal(checks, 1);
    failing = false;
    await sync.sync();
    assert.equal(checks, 2);
    assert.equal(rounds, mode === 'sync error' ? 2 : 1);
  });
}
