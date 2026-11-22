import type { SQLiteDatabase } from 'expo-sqlite';

export async function addAccountToGroupsAndTerrains(database: SQLiteDatabase) {
  await database.execAsync(`
    ALTER TABLE animal_groups
      ADD COLUMN account_id TEXT;

    ALTER TABLE terrains
      ADD COLUMN account_id TEXT;

    CREATE INDEX IF NOT EXISTS
      idx_animal_groups_account
    ON animal_groups(account_id);

    CREATE INDEX IF NOT EXISTS
      idx_terrains_account
    ON terrains(account_id);

    UPDATE animal_groups
    SET account_id = (
      SELECT account_id
      FROM feeding_group_accounts
      WHERE group_local_id = animal_groups.local_id
      LIMIT 1
    )
    WHERE account_id IS NULL;

    UPDATE terrains
    SET account_id = (
      SELECT account_id
      FROM occupations
      WHERE terrain_local_id = terrains.local_id
      LIMIT 1
    )
    WHERE account_id IS NULL;

    UPDATE terrains
    SET account_id = (
      SELECT account_id
      FROM movement_commands
      WHERE
        origin_terrain_local_id = terrains.local_id
        OR destination_terrain_local_id = terrains.local_id
      LIMIT 1
    )
    WHERE account_id IS NULL;
  `);
}
