import type { SQLiteDatabase } from 'expo-sqlite';

export async function createFeedingRecords(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE feeding_records (
      local_id TEXT PRIMARY KEY NOT NULL,
      remote_id TEXT,
      account_id TEXT NOT NULL,
      group_local_id TEXT NOT NULL,
      feed_local_id TEXT NOT NULL,
      quantity_scaled INTEGER NOT NULL CHECK(quantity_scaled > 0),
      occurred_at TEXT NOT NULL,
      sequence_number INTEGER NOT NULL,
      sync_status TEXT NOT NULL CHECK(sync_status IN ('pending_create','synced')),
      dispatch_state TEXT NOT NULL CHECK(dispatch_state IN ('queued','sending','uncertain','rejected','confirmed','cancelled')),
      balance_state TEXT NOT NULL CHECK(balance_state IN ('pending','incorporated','released')),
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
    CREATE INDEX idx_feeding_account ON feeding_records(account_id);
    CREATE INDEX idx_feeding_group ON feeding_records(account_id, group_local_id, occurred_at DESC);
    CREATE INDEX idx_feeding_queue ON feeding_records(account_id, feed_local_id, sequence_number);
    CREATE UNIQUE INDEX idx_feeding_remote ON feeding_records(account_id, remote_id) WHERE remote_id IS NOT NULL;

    -- Existing group deletion is physical. Preserve referenced offline history.
    CREATE TRIGGER protect_feeding_group BEFORE UPDATE OF sync_status ON animal_groups
    WHEN NEW.sync_status = 'pending_delete' AND (
      EXISTS(SELECT 1 FROM feed_requirements WHERE group_local_id = NEW.local_id) OR
      EXISTS(SELECT 1 FROM feeding_records WHERE group_local_id = NEW.local_id)
    ) BEGIN SELECT RAISE(ABORT, 'Grupo possui necessidades ou histórico de alimentação.'); END;
    CREATE TRIGGER protect_feeding_feed BEFORE UPDATE OF sync_status ON feeds
    WHEN NEW.sync_status = 'pending_delete' AND (
      EXISTS(SELECT 1 FROM feed_requirements WHERE feed_local_id = NEW.local_id) OR
      EXISTS(SELECT 1 FROM feeding_records WHERE feed_local_id = NEW.local_id AND balance_state = 'pending')
    ) BEGIN SELECT RAISE(ABORT, 'Ração possui necessidades ou alimentações pendentes.'); END;
  `);
}
