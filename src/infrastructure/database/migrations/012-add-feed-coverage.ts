import type { SQLiteDatabase } from 'expo-sqlite';

export async function addFeedCoverage(database: SQLiteDatabase) {
  await database.execAsync(`
    ALTER TABLE feeds
      ADD COLUMN daily_required_scaled INTEGER;

    ALTER TABLE feeds
      ADD COLUMN days_remaining INTEGER;

    ALTER TABLE feeds
      ADD COLUMN alert_level TEXT
      CHECK (
        alert_level IS NULL
        OR alert_level IN (
          'critical',
          'urgency',
          'attention',
          'info'
        )
      );
  `);
}
