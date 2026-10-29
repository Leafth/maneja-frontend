import type { SQLiteDatabase } from 'expo-sqlite';

export async function createFeedTable(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS feeds (
  local_id TEXT PRIMARY KEY NOT NULL,

  account_id TEXT NOT NULL,

  remote_id TEXT,

  name TEXT NOT NULL,

  initial_stock_scaled INTEGER,

  remote_stock_scaled INTEGER,

  projected_stock_scaled INTEGER NOT NULL DEFAULT 0,

  sync_status TEXT NOT NULL
    CHECK (
      sync_status IN (
        'synced',
        'pending_create',
        'pending_update',
        'pending_delete'
      )
    ),

  local_created_at TEXT NOT NULL,
  local_updated_at TEXT NOT NULL,

  remote_created_at TEXT,
  remote_updated_at TEXT,

  last_synced_at TEXT,
  last_sync_error TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS
  idx_feeds_account_remote_id
ON feeds(account_id, remote_id)
WHERE remote_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS
  idx_feeds_account_sync_status
ON feeds(account_id, sync_status);

CREATE INDEX IF NOT EXISTS
  idx_feeds_account_name
ON feeds(account_id, name);
`);
}
