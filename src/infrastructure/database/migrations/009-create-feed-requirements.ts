import type { SQLiteDatabase } from 'expo-sqlite';

export async function createFeedRequirements(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE feeding_group_accounts (
      group_local_id TEXT PRIMARY KEY NOT NULL REFERENCES animal_groups(local_id) ON DELETE CASCADE,
      account_id TEXT NOT NULL,
      UNIQUE(account_id, group_local_id)
    );
    CREATE UNIQUE INDEX idx_feeds_account_local ON feeds(account_id, local_id);
    CREATE TABLE feed_requirements (
      local_id TEXT PRIMARY KEY NOT NULL,
      remote_id TEXT,
      account_id TEXT NOT NULL,
      group_local_id TEXT NOT NULL,
      feed_local_id TEXT NOT NULL,
      quantity_per_animal_scaled INTEGER NOT NULL CHECK(quantity_per_animal_scaled > 0),
      sync_status TEXT NOT NULL CHECK(sync_status IN ('synced','pending_create','pending_update','pending_delete')),
      dispatch_state TEXT NOT NULL CHECK(dispatch_state IN ('idle','sending','uncertain','rejected','conflict')),
      locally_deleted_at TEXT,
      local_created_at TEXT NOT NULL,
      local_updated_at TEXT NOT NULL,
      remote_created_at TEXT,
      remote_updated_at TEXT,
      last_synced_at TEXT,
      last_sync_error TEXT,
      last_sync_http_status INTEGER,
      FOREIGN KEY(account_id, group_local_id) REFERENCES feeding_group_accounts(account_id, group_local_id) ON DELETE RESTRICT,
      FOREIGN KEY(account_id, feed_local_id) REFERENCES feeds(account_id, local_id) ON DELETE RESTRICT
    );
    CREATE INDEX idx_requirements_account ON feed_requirements(account_id);
    CREATE INDEX idx_requirements_group ON feed_requirements(account_id, group_local_id);
    CREATE UNIQUE INDEX idx_requirements_remote ON feed_requirements(account_id, remote_id) WHERE remote_id IS NOT NULL;
    CREATE UNIQUE INDEX idx_requirements_active ON feed_requirements(account_id, group_local_id, feed_local_id) WHERE locally_deleted_at IS NULL;
  `);
}
