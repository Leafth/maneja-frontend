import * as SQLite from 'expo-sqlite';

import { migrateDatabase } from './migrations/migrate';

const DATABASE_NAME = 'maneja.db';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  await migrateDatabase(database);

  return database;
}
