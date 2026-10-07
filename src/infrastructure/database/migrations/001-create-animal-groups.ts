import type { SQLiteDatabase } from 'expo-sqlite';

export async function createAnimalGroupsTable(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS animal_groups (
      local_id TEXT PRIMARY KEY NOT NULL,

      remote_id TEXT UNIQUE,

      name TEXT NOT NULL,

      animal_count INTEGER NOT NULL
        CHECK (animal_count >= 0),

      sync_status TEXT NOT NULL
        CHECK (
          sync_status IN (
            'synced',
            'pending_create',
            'pending_update',
            'pending_delete'
          )
        ),

      remote_created_at TEXT,
      remote_updated_at TEXT,

      local_created_at TEXT NOT NULL,
      local_updated_at TEXT NOT NULL,

      last_synced_at TEXT,
      last_sync_error TEXT
    );

    CREATE INDEX IF NOT EXISTS
      idx_animal_groups_remote_id
      ON animal_groups(remote_id);

    CREATE INDEX IF NOT EXISTS
      idx_animal_groups_sync_status
      ON animal_groups(sync_status);
  `);
}
