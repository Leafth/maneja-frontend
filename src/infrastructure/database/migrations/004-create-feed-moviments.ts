import type { SQLiteDatabase } from 'expo-sqlite';

export async function createFeedMovimentsTable(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS feed_movements (
  local_id TEXT PRIMARY KEY NOT NULL,

  account_id TEXT NOT NULL,

  remote_id TEXT,

  feed_local_id TEXT NOT NULL,

  movement_type TEXT NOT NULL
    CHECK (
      movement_type IN ('entry', 'exit')
    ),

  quantity_scaled INTEGER NOT NULL
    CHECK (quantity_scaled > 0),

  value_scaled INTEGER,

  reason TEXT,

  occurred_on TEXT NOT NULL,

  sequence_number INTEGER NOT NULL,

  sync_status TEXT NOT NULL
    CHECK (
      sync_status IN (
        'pending_create',
        'synced'
      )
    ),

  dispatch_state TEXT NOT NULL
    CHECK (
      dispatch_state IN (
        'queued',
        'sending',
        'uncertain',
        'rejected',
        'confirmed'
      )
    ),

  balance_state TEXT NOT NULL
    CHECK (
      balance_state IN (
        'pending',
        'incorporated'
      )
    ),

  local_created_at TEXT NOT NULL,
  local_updated_at TEXT NOT NULL,

  remote_created_at TEXT,
  remote_updated_at TEXT,

  last_synced_at TEXT,
  last_sync_error TEXT,

  FOREIGN KEY (feed_local_id)
    REFERENCES feeds(local_id)
    ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS
  idx_feed_movements_account_remote
ON feed_movements(account_id, remote_id)
WHERE remote_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS
  idx_feed_movements_feed
ON feed_movements(account_id, feed_local_id);

CREATE INDEX IF NOT EXISTS
  idx_feed_movements_pending
ON feed_movements(
  account_id,
  sync_status,
  dispatch_state
);

CREATE INDEX IF NOT EXISTS
  idx_feed_movements_sequence
ON feed_movements(
  feed_local_id,
  sequence_number
);
`);
}
