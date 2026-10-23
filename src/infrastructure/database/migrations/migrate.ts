import type { SQLiteDatabase } from 'expo-sqlite';

import { createAnimalGroupsTable } from './001-create-animal-groups';
import { createTerrainsTable } from './002-create-terrains';

const DATABASE_VERSION = 2;

export async function migrateDatabase(database: SQLiteDatabase) {
  const result = await database.getFirstAsync<{
    user_version: number;
  }>('PRAGMA user_version');

  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  await database.withTransactionAsync(async () => {
    if (currentVersion < 1) {
      await createAnimalGroupsTable(database);
    }

    if (currentVersion < 2) {
      await createTerrainsTable(database);
    }

    await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
}
