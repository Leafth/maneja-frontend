import type { SQLiteDatabase } from 'expo-sqlite';

export async function createOccupationsTable(database: SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS occupations (
      local_id TEXT PRIMARY KEY NOT NULL,
      remote_id TEXT,
      account_id TEXT NOT NULL,

      group_local_id TEXT,
      group_remote_id TEXT,
      group_name TEXT NOT NULL,

      terrain_local_id TEXT,
      terrain_remote_id TEXT,
      terrain_name TEXT NOT NULL,

      started_at TEXT NOT NULL,
      ended_at TEXT,

      movement_command_local_id TEXT,
      source TEXT NOT NULL
        CHECK (source IN ('local', 'remote')),

      FOREIGN KEY (group_local_id)
        REFERENCES animal_groups(local_id)
        ON DELETE SET NULL,

      FOREIGN KEY (terrain_local_id)
        REFERENCES terrains(local_id)
        ON DELETE SET NULL,

      FOREIGN KEY (movement_command_local_id)
        REFERENCES movement_commands(local_id)
        ON DELETE SET NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS
      idx_occupations_remote
    ON occupations(account_id, remote_id)
    WHERE remote_id IS NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS
      idx_occupations_movement_command
    ON occupations(movement_command_local_id)
    WHERE movement_command_local_id IS NOT NULL;

    CREATE INDEX IF NOT EXISTS
      idx_occupations_group_local
    ON occupations(group_local_id, started_at DESC);

    CREATE INDEX IF NOT EXISTS
      idx_occupations_terrain_local
    ON occupations(terrain_local_id, started_at DESC);

    CREATE INDEX IF NOT EXISTS
      idx_occupations_group_remote
    ON occupations(group_remote_id, started_at DESC);

    CREATE INDEX IF NOT EXISTS
      idx_occupations_terrain_remote
    ON occupations(terrain_remote_id, started_at DESC);
  `);
}
