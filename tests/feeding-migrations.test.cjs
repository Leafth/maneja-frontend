const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { harness } = require('./feeding-harness.cjs');

for (const version of [0, 8]) test(`feeding migration from version ${version} preserves data`, async () => {
  const h = harness();
  try {
    if (version === 8) {
      const files = fs.readdirSync('src/infrastructure/database/migrations').filter(f => /^00[1-8]-/.test(f)).sort();
      for (const file of files) await Object.values(h.load('src/infrastructure/database/migrations/' + file))[0](h.db);
      h.native.exec("PRAGMA user_version = 8; INSERT INTO animal_groups(local_id,name,animal_count,sync_status,local_created_at,local_updated_at) VALUES('legacy','Legado',2,'pending_create','now','now')");
    }
    await h.load('src/infrastructure/database/migrations/migrate.ts').migrateDatabase(h.db);
    assert.equal(h.native.prepare('PRAGMA user_version').get().user_version, 10);
    assert.equal(h.native.prepare('SELECT count(*) AS n FROM feeding_group_accounts').get().n, 0);
    if (version === 8) assert.equal(h.native.prepare('SELECT name FROM animal_groups').get().name, 'Legado');
    await h.load('src/infrastructure/database/migrations/migrate.ts').migrateDatabase(h.db);
    assert.deepEqual(h.native.prepare('PRAGMA foreign_key_check').all(), []);
  } finally { h.close(); }
});
