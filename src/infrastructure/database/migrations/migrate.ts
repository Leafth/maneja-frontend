import type { SQLiteDatabase } from 'expo-sqlite';

import { createAnimalGroupsTable } from './001-create-animal-groups';
import { createTerrainsTable } from './002-create-terrains';
import { createFeedTable } from './003-create-feed';
import { createFeedMovimentsTable } from './004-create-feed-moviments';
import { createMovementCommandsTable } from './005-create-movement-commands';
import { addCurrentTerrainToAnimalGroups } from './006-add-current-terrain-to-animal-groups';
import { createOccupationsTable } from './007-create-occupations';

const DATABASE_VERSION = 7;

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

    if (currentVersion < 3) {
      await createFeedTable(database);
    }

    if (currentVersion < 4) {
      await createFeedMovimentsTable(database);
    }

    if (currentVersion < 5) {
      await createMovementCommandsTable(database);
    }

    if (currentVersion < 6) {
      await addCurrentTerrainToAnimalGroups(database);
    }

    if (currentVersion < 7) {
      await createOccupationsTable(database);
    }

    await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
}
