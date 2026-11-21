import type { SQLiteDatabase } from 'expo-sqlite';

export async function createMovementCommandsTable(
  database: SQLiteDatabase,
) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS movement_commands (
      local_id TEXT PRIMARY KEY NOT NULL,

      account_id TEXT NOT NULL,

      remote_id TEXT,

      group_local_id TEXT NOT NULL,

      origin_terrain_local_id TEXT,
      destination_terrain_local_id TEXT NOT NULL,

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

      local_created_at TEXT NOT NULL,
      local_updated_at TEXT NOT NULL,

      remote_started_at TEXT,

      last_synced_at TEXT,
      last_sync_error TEXT,

      FOREIGN KEY (group_local_id)
        REFERENCES animal_groups(local_id)
        ON DELETE RESTRICT,

      FOREIGN KEY (origin_terrain_local_id)
        REFERENCES terrains(local_id)
        ON DELETE RESTRICT,

      FOREIGN KEY (destination_terrain_local_id)
        REFERENCES terrains(local_id)
        ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS
      idx_movement_commands_account
    ON movement_commands(account_id);

    CREATE INDEX IF NOT EXISTS
      idx_movement_commands_group
    ON movement_commands(
      account_id,
      group_local_id,
      sequence_number
    );

    CREATE INDEX IF NOT EXISTS
      idx_movement_commands_pending
    ON movement_commands(
      account_id,
      sync_status,
      dispatch_state
    );

    CREATE UNIQUE INDEX IF NOT EXISTS
      idx_movement_commands_remote
    ON movement_commands(account_id, remote_id)
    WHERE remote_id IS NOT NULL;
  `);
}
