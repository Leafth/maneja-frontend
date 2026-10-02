import type { SQLiteDatabase } from 'expo-sqlite';

import { createAnimalGroupsTable } from './001-create-animal-groups';

const DATABASE_VERSION = 1;

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

    await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
}
