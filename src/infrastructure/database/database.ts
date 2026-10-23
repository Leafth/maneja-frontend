import * as SQLite from 'expo-sqlite';

import { migrateDatabase } from './migrations/migrate';

const DATABASE_NAME = 'maneja.db';

interface DatabaseState {
  initialization: Promise<SQLite.SQLiteDatabase> | null;
  operations: Promise<void>;
}

// Fast Refresh must not replace the connection or the queue of an active runtime.
const runtime = globalThis as typeof globalThis & {
  __manejaDatabaseState?: DatabaseState;
};

const state = (runtime.__manejaDatabaseState ??= {
  initialization: null,
  operations: Promise.resolve(),
});

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  try {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);

    await migrateDatabase(database);

    return database;
  } catch (error) {
    // This handle was never published; no queued operation can be using it.
    try {
      await database.closeAsync();
    } catch {
      // Preserve the initialization error if native cleanup also fails.
    }
    throw error;
  }
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!state.initialization) {
    state.initialization = Promise.resolve()
      .then(initializeDatabase)
      .catch((error: unknown) => {
        state.initialization = null;
        throw error;
      });
  }

  return state.initialization;
}

type DatabaseOperations = Pick<
  SQLite.SQLiteDatabase,
  'getAllAsync' | 'getFirstAsync' | 'runAsync'
>;

/**
 * All application SQL goes through this queue. Await each query inside the
 * callback; do not call withDatabase (or a LocalDataSource method) recursively.
 * Migrations use the private initializing handle, before any callback can run.
 */
export function withDatabase<T>(
  operation: (database: DatabaseOperations) => Promise<T>,
): Promise<T> {
  const result = state.operations.then(async () => operation(await getDatabase()));

  // A failed operation rejects its caller, but must not poison the queue.
  state.operations = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}
