import {
  getDatabase,
  withDatabaseTransaction,
} from '@/infrastructure/database/database';

import type { TerrainStatus } from '../models/terrain-status.model';
import type { Terrain } from '../models/terrain.model';

interface TerrainRow {
  local_id: string;
  account_id: string;

  remote_id: string | null;
  locally_deleted_at: string | null;

  name: string;
  rest_days: number;
  status: TerrainStatus;

  sync_status: Terrain['syncStatus'];

  remote_created_at: string | null;
  remote_updated_at: string | null;

  local_created_at: string;
  local_updated_at: string;

  last_synced_at: string | null;
  last_sync_error: string | null;
}

function toTerrain(row: TerrainRow): Terrain {
  return {
    localId: row.local_id,
    accountId: row.account_id,

    remoteId: row.remote_id,
    locallyDeletedAt: row.locally_deleted_at,

    name: row.name,
    restDays: row.rest_days,
    status: row.status,

    syncStatus: row.sync_status,

    remoteCreatedAt: row.remote_created_at,
    remoteUpdatedAt: row.remote_updated_at,

    localCreatedAt: row.local_created_at,
    localUpdatedAt: row.local_updated_at,

    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,
  };
}

async function findAll(accountId: string): Promise<Terrain[]> {
  const database = await getDatabase();

  const rows = await database.getAllAsync<TerrainRow>(
    `
      SELECT *
      FROM terrains
      WHERE account_id = ?
        AND locally_deleted_at IS NULL
        AND sync_status != 'pending_delete'
      ORDER BY COALESCE(
        remote_created_at,
        local_created_at
      ) DESC
    `,
    [accountId],
  );

  return rows.map(toTerrain);
}

async function findByLocalId(
  accountId: string,
  localId: string,
): Promise<Terrain | null> {
  const database = await getDatabase();

  const row = await database.getFirstAsync<TerrainRow>(
    `
      SELECT *
      FROM terrains
      WHERE account_id = ?
        AND local_id = ?
        AND locally_deleted_at IS NULL
      LIMIT 1
    `,
    [accountId, localId],
  );

  return row ? toTerrain(row) : null;
}

async function findByRemoteId(
  accountId: string,
  remoteId: string,
): Promise<Terrain | null> {
  const database = await getDatabase();

  const row = await database.getFirstAsync<TerrainRow>(
    `
      SELECT *
      FROM terrains
      WHERE account_id = ?
        AND remote_id = ?
      LIMIT 1
    `,
    [accountId, remoteId],
  );

  return row ? toTerrain(row) : null;
}

async function insert(terrain: Terrain): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      INSERT INTO terrains (
        local_id,
        account_id,
        remote_id,
        locally_deleted_at,
        name,
        rest_days,
        status,
        sync_status,
        remote_created_at,
        remote_updated_at,
        local_created_at,
        local_updated_at,
        last_synced_at,
        last_sync_error
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      terrain.localId,
      terrain.accountId,

      terrain.remoteId,
      terrain.locallyDeletedAt,

      terrain.name,
      terrain.restDays,
      terrain.status,

      terrain.syncStatus,

      terrain.remoteCreatedAt,
      terrain.remoteUpdatedAt,

      terrain.localCreatedAt,
      terrain.localUpdatedAt,

      terrain.lastSyncedAt,
      terrain.lastSyncError,
    ],
  );
}

async function update(terrain: Terrain): Promise<void> {
  await withDatabaseTransaction(async (database) => {
    await database.runAsync(
      `
        UPDATE terrains
        SET
          remote_id = ?,
          name = ?,
          rest_days = ?,
          status = ?,
          sync_status = ?,
          remote_created_at = ?,
          remote_updated_at = ?,
          local_created_at = ?,
          local_updated_at = ?,
          last_synced_at = ?,
          last_sync_error = ?
        WHERE account_id = ?
          AND local_id = ?
          AND locally_deleted_at IS NULL
      `,
      [
        terrain.remoteId,

        terrain.name,
        terrain.restDays,
        terrain.status,

        terrain.syncStatus,

        terrain.remoteCreatedAt,
        terrain.remoteUpdatedAt,

        terrain.localCreatedAt,
        terrain.localUpdatedAt,

        terrain.lastSyncedAt,
        terrain.lastSyncError,

        terrain.accountId,
        terrain.localId,
      ],
    );

    await database.runAsync(
      `
        UPDATE animal_groups
        SET current_terrain_name = ?
        WHERE account_id = ?
          AND (
            current_terrain_local_id = ?
            OR (
              ? IS NOT NULL
              AND current_terrain_remote_id = ?
            )
          )
      `,
      [
        terrain.name,
        terrain.accountId,

        terrain.localId,

        terrain.remoteId,
        terrain.remoteId,
      ],
    );

    await database.runAsync(
      `
        UPDATE occupations
        SET terrain_name = ?
        WHERE account_id = ?
          AND (
            terrain_local_id = ?
            OR (
              ? IS NOT NULL
              AND terrain_remote_id = ?
            )
          )
      `,
      [
        terrain.name,
        terrain.accountId,

        terrain.localId,

        terrain.remoteId,
        terrain.remoteId,
      ],
    );
  });
}

async function markPendingDelete(
  accountId: string,
  localId: string,
  localUpdatedAt: string,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE terrains
      SET
        sync_status = 'pending_delete',
        local_updated_at = ?,
        last_sync_error = NULL
      WHERE account_id = ?
        AND local_id = ?
        AND locally_deleted_at IS NULL
    `,
    [localUpdatedAt, accountId, localId],
  );
}

async function deleteByLocalId(
  accountId: string,
  localId: string,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE terrains
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
  );
}

async function findPending(accountId: string): Promise<Terrain[]> {
  const database = await getDatabase();

  const rows = await database.getAllAsync<TerrainRow>(
    `
      SELECT *
      FROM terrains
      WHERE account_id = ?
        AND locally_deleted_at IS NULL
        AND sync_status IN (
          'pending_create',
          'pending_update',
          'pending_delete'
        )
      ORDER BY local_updated_at ASC
    `,
    [accountId],
  );

  return rows.map(toTerrain);
}

async function setSyncError(
  accountId: string,
  localId: string,
  error: string,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE terrains
      SET last_sync_error = ?
      WHERE account_id = ?
        AND local_id = ?
        AND locally_deleted_at IS NULL
    `,
    [error, accountId, localId],
  );
}

async function markAsSynced(
  accountId: string,
  localId: string,
  data: {
    remoteId: string;
    name: string;
    restDays: number;
    status: TerrainStatus;

    remoteCreatedAt: string;
    remoteUpdatedAt: string;

    syncedAt: string;
  },
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE terrains
      SET
        remote_id = ?,
        name = ?,
        rest_days = ?,
        status = ?,

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
      data.restDays,
      data.status,

      data.remoteCreatedAt,
      data.remoteUpdatedAt,

      data.syncedAt,

      accountId,
      localId,
    ],
  );
}

async function cancelPendingDelete(
  accountId: string,
  localId: string,
  error: string,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE terrains
      SET
        sync_status = 'synced',
        local_updated_at = ?,
        last_sync_error = ?

      WHERE account_id = ?
        AND local_id = ?
        AND locally_deleted_at IS NULL
    `,
    [new Date().toISOString(), error, accountId, localId],
  );
}

export const terrainLocalDataSource = {
  findAll,
  findByLocalId,
  findByRemoteId,

  insert,
  update,

  markPendingDelete,
  deleteByLocalId,

  findPending,

  setSyncError,
  markAsSynced,

  cancelPendingDelete,
};
