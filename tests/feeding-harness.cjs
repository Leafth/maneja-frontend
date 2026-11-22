const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { DatabaseSync } = require('node:sqlite');
const { randomUUID } = require('node:crypto');
const ts = require('typescript');

function harness(overrides = {}, filename = ':memory:') {
  const native = new DatabaseSync(filename);
  native.exec('PRAGMA foreign_keys = ON');
  const args = values => Array.isArray(values[0]) ? values[0] : values;
  const db = {
    execAsync: async sql => native.exec(sql),
    runAsync: async (sql, ...values) => native.prepare(sql).run(...args(values)),
    getAllAsync: async (sql, ...values) => native.prepare(sql).all(...args(values)),
    getFirstAsync: async (sql, ...values) => native.prepare(sql).get(...args(values)) ?? null,
  };
  let queue = Promise.resolve();
  const transaction = work => {
    const result = queue.then(async () => {
      native.exec('BEGIN');
      try { const value = await work(db); native.exec('COMMIT'); return value; }
      catch (error) { native.exec('ROLLBACK'); throw error; }
    });
    queue = result.catch(() => {});
    return result;
  };
  db.withExclusiveTransactionAsync = transaction;
  db.withTransactionAsync = transaction;
  const cache = new Map();
  const dependencies = {
    'expo-crypto': { randomUUID },
    '@/infrastructure/api': { api: {} },
    '@/infrastructure/database/database': {
      getDatabase: async () => db, withDatabase: work => work(db), withDatabaseTransaction: transaction,
    },
    ...overrides,
  };
  function load(file) {
    file = path.resolve(__dirname, '..', file);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(source, {
      module, exports: module.exports, Date, console, globalThis: {},
      require: id => {
        if (id in dependencies) return dependencies[id];
        if (!id.startsWith('.') && !id.startsWith('@/')) return require(id);
        const target = id.startsWith('@/') ? path.resolve(__dirname, '../src', id.slice(2)) : path.resolve(path.dirname(file), id);
        return load(fs.existsSync(target + '.ts') ? target + '.ts' : path.join(target, 'index.ts'));
      },
    }, { filename: file });
    return module.exports;
  }
  return { native, db, load, close: () => native.close() };
}
module.exports = { harness };
