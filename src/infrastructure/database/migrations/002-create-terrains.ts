import type { SQLiteDatabase } from 'expo-sqlite';

export async function createTerrainsTable(database: SQLiteDatabase) {
  await database.execAsync(`
  CREATE TABLE IF NOT EXISTS terrains (
    local_id TEXT PRIMARY KEY NOT NULL,
    remote_id TEXT UNIQUE,

    name TEXT NOT NULL,
    rest_days INTEGER NOT NULL CHECK (rest_days >= 0),

    status TEXT NOT NULL
      CHECK (
        status IN (
          'available',
          'occupied',
          'resting'
        )
      ),

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
    index_terrains_on_sync_status
  ON terrains(sync_status);

  CREATE INDEX IF NOT EXISTS
    index_terrains_on_status
  ON terrains(status);
`);
}
