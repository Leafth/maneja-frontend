import {
  withDatabase,
  withDatabaseTransaction,
} from '@/infrastructure/database/database';

import { SyncStatus } from '@/shared/models';

import type { AnimalGroup } from '../models';

interface AnimalGroupRow {
  local_id: string;
  account_id: string;
  remote_id: string | null;
  locally_deleted_at: string | null;

  name: string;
  animal_count: number;

  sync_status: SyncStatus;

  remote_created_at: string | null;
  remote_updated_at: string | null;

  local_created_at: string;
  local_updated_at: string;

  current_terrain_local_id: string | null;
  current_terrain_remote_id: string | null;
  current_terrain_name: string | null;

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

  currentTerrainRemoteId: string | null;
  currentTerrainName: string | null;

  remoteCreatedAt: string;
  remoteUpdatedAt: string;
}

function toModel(row: AnimalGroupRow): AnimalGroup {
  return {
    localId: row.local_id,
    accountId: row.account_id,

    remoteId: row.remote_id,
    locallyDeletedAt: row.locally_deleted_at,

    name: row.name,
    animalCount: row.animal_count,

    syncStatus: row.sync_status,

    remoteCreatedAt: row.remote_created_at,
    remoteUpdatedAt: row.remote_updated_at,

    localCreatedAt: row.local_created_at,
    localUpdatedAt: row.local_updated_at,

    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,

    currentTerrainLocalId: row.current_terrain_local_id,
    currentTerrainRemoteId: row.current_terrain_remote_id,
    currentTerrainName: row.current_terrain_name,
  };
}

async function findAll(accountId: string): Promise<AnimalGroup[]> {
  const rows = await withDatabase((database) =>
    database.getAllAsync<AnimalGroupRow>(
      `
        SELECT *
        FROM animal_groups
        WHERE account_id = ?
          AND locally_deleted_at IS NULL
          AND sync_status != 'pending_delete'
        ORDER BY COALESCE(
          remote_created_at,
          local_created_at
        ) DESC
      `,
      [accountId],
    ),
  );

  return rows.map(toModel);
}

async function findByLocalId(
  accountId: string,
  localId: string,
): Promise<AnimalGroup | null> {
  const row = await withDatabase((database) =>
    database.getFirstAsync<AnimalGroupRow>(
      `
        SELECT *
        FROM animal_groups
        WHERE account_id = ?
          AND local_id = ?
          AND locally_deleted_at IS NULL
        LIMIT 1
      `,
      [accountId, localId],
    ),
  );

  return row ? toModel(row) : null;
}

async function findByRemoteId(
  accountId: string,
  remoteId: string,
): Promise<AnimalGroup | null> {
  const row = await withDatabase((database) =>
    database.getFirstAsync<AnimalGroupRow>(
      `
        SELECT *
        FROM animal_groups
        WHERE account_id = ?
          AND remote_id = ?
        LIMIT 1
      `,
      [accountId, remoteId],
    ),
  );

  return row ? toModel(row) : null;
}

async function insert(group: AnimalGroup): Promise<void> {
  await withDatabaseTransaction(async (database) => {
    await database.runAsync(
      `
        INSERT INTO animal_groups (
          local_id,
          account_id,
          remote_id,
          locally_deleted_at,
          name,
          animal_count,
          sync_status,
          remote_created_at,
          remote_updated_at,
          local_created_at,
          local_updated_at,
          last_synced_at,
          last_sync_error,
          current_terrain_local_id,
          current_terrain_remote_id,
          current_terrain_name
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `,
      [
        group.localId,
        group.accountId,
        group.remoteId,
        group.locallyDeletedAt,

        group.name,
        group.animalCount,

        group.syncStatus,

        group.remoteCreatedAt,
        group.remoteUpdatedAt,

        group.localCreatedAt,
        group.localUpdatedAt,

        group.lastSyncedAt,
        group.lastSyncError,

        group.currentTerrainLocalId,
        group.currentTerrainRemoteId,
        group.currentTerrainName,
      ],
    );

    await database.runAsync(
      `
        INSERT OR IGNORE INTO feeding_group_accounts (
          group_local_id,
          account_id
        )
        VALUES (?, ?)
      `,
      [group.localId, group.accountId],
    );
  });
}

async function update(
  accountId: string,
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
        WHERE account_id = ?
          AND local_id = ?
          AND locally_deleted_at IS NULL
      `,
      [
        data.name,
        data.animalCount,
        data.syncStatus,
        data.localUpdatedAt,

        accountId,
        localId,
      ],
    ),
  );
}

async function markPendingDelete(
  accountId: string,
  localId: string,
): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        UPDATE animal_groups
        SET
          sync_status = 'pending_delete',
          local_updated_at = ?,
          last_sync_error = NULL
        WHERE account_id = ?
          AND local_id = ?
          AND locally_deleted_at IS NULL
      `,
      [new Date().toISOString(), accountId, localId],
    ),
  );
}

async function deleteByLocalId(
  accountId: string,
  localId: string,
): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        UPDATE animal_groups
        SET
          sync_status = 'synced',
          locally_deleted_at =
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
          last_synced_at =
            strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
          last_sync_error = NULL
        WHERE account_id = ?
          AND local_id = ?
          AND locally_deleted_at IS NULL
      `,
      [accountId, localId],
    ),
  );
}

async function findPending(accountId: string): Promise<AnimalGroup[]> {
  const rows = await withDatabase((database) =>
    database.getAllAsync<AnimalGroupRow>(
      `
        SELECT *
        FROM animal_groups
        WHERE account_id = ?
          AND locally_deleted_at IS NULL
          AND sync_status != 'synced'
        ORDER BY local_updated_at ASC
      `,
      [accountId],
    ),
  );

  return rows.map(toModel);
}

async function setSyncError(
  accountId: string,
  localId: string,
  message: string,
): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        UPDATE animal_groups
        SET last_sync_error = ?
        WHERE account_id = ?
          AND local_id = ?
          AND locally_deleted_at IS NULL
      `,
      [message, accountId, localId],
    ),
  );
}

async function markAsSynced(
  accountId: string,
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

          current_terrain_local_id = (
            SELECT local_id
            FROM terrains
            WHERE account_id = ?
              AND remote_id = ?
            LIMIT 1
          ),

          current_terrain_remote_id = ?,
          current_terrain_name = ?,

          sync_status = CASE
            WHEN sync_status = 'pending_delete'
              THEN 'pending_delete'
            ELSE 'synced'
          END,

          remote_created_at = ?,
          remote_updated_at = ?,
          last_synced_at = ?,
          last_sync_error = NULL

        WHERE account_id = ?
          AND local_id = ?
          AND locally_deleted_at IS NULL
      `,
      [
        data.remoteId,
        data.name,
        data.animalCount,

        accountId,
        data.currentTerrainRemoteId,

        data.currentTerrainRemoteId,
        data.currentTerrainName,

        data.remoteCreatedAt,
        data.remoteUpdatedAt,

        now,

        accountId,
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
