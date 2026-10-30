import type { SQLiteDatabase } from 'expo-sqlite';

export async function addLocallyDeletedAtToFeeds(database: SQLiteDatabase) {
  await database.execAsync(`
    ALTER TABLE feeds
    ADD COLUMN locally_deleted_at TEXT;
  `);
}
