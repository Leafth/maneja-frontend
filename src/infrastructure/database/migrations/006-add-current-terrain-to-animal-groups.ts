import type { SQLiteDatabase } from 'expo-sqlite';

export async function addCurrentTerrainToAnimalGroups(
  database: SQLiteDatabase,
) {
  await database.execAsync(`
    ALTER TABLE animal_groups
      ADD COLUMN current_terrain_local_id TEXT;

    ALTER TABLE animal_groups
      ADD COLUMN current_terrain_remote_id TEXT;

    ALTER TABLE animal_groups
      ADD COLUMN current_terrain_name TEXT;
  `);
}
