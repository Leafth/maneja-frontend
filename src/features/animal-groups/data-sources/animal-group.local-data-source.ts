import { withDatabase } from '@/infrastructure/database/database';

import type { AnimalGroup, SyncStatus } from '../models';

interface AnimalGroupRow {
  local_id: string;
  remote_id: string | null;

  name: string;
  animal_count: number;

  sync_status: SyncStatus;

  remote_created_at: string | null;
  remote_updated_at: string | null;

  local_created_at: string;
  local_updated_at: string;

  last_synced_at: string | null;
  last_sync_error: string | null;
}

interface UpdateAnimalGroupLocalData {
  name: string;
  animalCount: number;
  syncStatus: SyncStatus;
  localUpdatedAt: string;
}

interface MarkAnimalGroupSyncedData {
  remoteId: string;
  name: string;
  animalCount: number;
  remoteCreatedAt: string;
  remoteUpdatedAt: string;
}

function toModel(row: AnimalGroupRow): AnimalGroup {
  return {
    localId: row.local_id,
    remoteId: row.remote_id,

    name: row.name,
    animalCount: row.animal_count,

    syncStatus: row.sync_status,

    remoteCreatedAt: row.remote_created_at,
    remoteUpdatedAt: row.remote_updated_at,

    localCreatedAt: row.local_created_at,
    localUpdatedAt: row.local_updated_at,

    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,
  };
}

async function findAll(): Promise<AnimalGroup[]> {
  const rows = await withDatabase((database) =>
    database.getAllAsync<AnimalGroupRow>(`
      SELECT *
      FROM animal_groups
      WHERE sync_status != 'pending_delete'
      ORDER BY local_updated_at DESC
    `),
  );

  return rows.map(toModel);
}

async function findByLocalId(localId: string): Promise<AnimalGroup | null> {
  const row = await withDatabase((database) =>
    database.getFirstAsync<AnimalGroupRow>(
      `
        SELECT *
        FROM animal_groups
        WHERE local_id = ?
        LIMIT 1
      `,
      [localId],
    ),
  );

  return row ? toModel(row) : null;
}

async function findByRemoteId(remoteId: string): Promise<AnimalGroup | null> {
  const row = await withDatabase((database) =>
    database.getFirstAsync<AnimalGroupRow>(
      `
        SELECT *
        FROM animal_groups
        WHERE remote_id = ?
        LIMIT 1
      `,
      [remoteId],
    ),
  );

  return row ? toModel(row) : null;
}

async function insert(group: AnimalGroup): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        INSERT INTO animal_groups (
          local_id,
          remote_id,
          name,
          animal_count,
          sync_status,
          remote_created_at,
          remote_updated_at,
          local_created_at,
          local_updated_at,
          last_synced_at,
          last_sync_error
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        group.localId,
        group.remoteId,
        group.name,
        group.animalCount,
        group.syncStatus,
        group.remoteCreatedAt,
        group.remoteUpdatedAt,
        group.localCreatedAt,
        group.localUpdatedAt,
        group.lastSyncedAt,
        group.lastSyncError,
      ],
    ),
  );
}

async function update(
  localId: string,
  data: UpdateAnimalGroupLocalData,
): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        UPDATE animal_groups
        SET
          name = ?,
          animal_count = ?,
          sync_status = ?,
          local_updated_at = ?,
          last_sync_error = NULL
        WHERE local_id = ?
      `,
      [
        data.name,
        data.animalCount,
        data.syncStatus,
        data.localUpdatedAt,
        localId,
      ],
    ),
  );
}

async function markPendingDelete(localId: string): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        UPDATE animal_groups
        SET
          sync_status = 'pending_delete',
          local_updated_at = ?,
          last_sync_error = NULL
        WHERE local_id = ?
      `,
      [new Date().toISOString(), localId],
    ),
  );
}

async function deleteByLocalId(localId: string): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        DELETE FROM animal_groups
        WHERE local_id = ?
      `,
      [localId],
    ),
  );
}

async function findPending(): Promise<AnimalGroup[]> {
  const rows = await withDatabase((database) =>
    database.getAllAsync<AnimalGroupRow>(`
      SELECT *
      FROM animal_groups
      WHERE sync_status != 'synced'
      ORDER BY local_updated_at ASC
    `),
  );

  return rows.map(toModel);
}

async function setSyncError(localId: string, message: string): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        UPDATE animal_groups
        SET last_sync_error = ?
        WHERE local_id = ?
      `,
      [message, localId],
    ),
  );
}

async function markAsSynced(
  localId: string,
  data: MarkAnimalGroupSyncedData,
): Promise<void> {
  const now = new Date().toISOString();

  await withDatabase((database) =>
    database.runAsync(
      `
        UPDATE animal_groups
        SET
          remote_id = ?,
          name = ?,
          animal_count = ?,
          sync_status = 'synced',
          remote_created_at = ?,
          remote_updated_at = ?,
          last_synced_at = ?,
          last_sync_error = NULL
        WHERE local_id = ?
      `,
      [
        data.remoteId,
        data.name,
        data.animalCount,
        data.remoteCreatedAt,
        data.remoteUpdatedAt,
        now,
        localId,
      ],
    ),
  );
}

export const animalGroupLocalDataSource = {
  findAll,
  findByLocalId,
  findByRemoteId,
  findPending,

  insert,
  update,

  markPendingDelete,
  deleteByLocalId,

  markAsSynced,
  setSyncError,
};
