import { getDatabase } from '@/infrastructure/database/database';
import type { TerrainStatus } from '../models/terrain-status.model';
import type { Terrain } from '../models/terrain.model';

interface TerrainRow {
  local_id: string;
  remote_id: string | null;

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
    remoteId: row.remote_id,

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

async function findAll(): Promise<Terrain[]> {
  const database = await getDatabase();

  const rows = await database.getAllAsync<TerrainRow>(
    `
      SELECT *
      FROM terrains
      WHERE sync_status != 'pending_delete'
      ORDER BY local_updated_at DESC
    `,
  );

  return rows.map(toTerrain);
}

async function findByLocalId(localId: string): Promise<Terrain | null> {
  const database = await getDatabase();

  const row = await database.getFirstAsync<TerrainRow>(
    `
      SELECT *
      FROM terrains
      WHERE local_id = ?
      LIMIT 1
    `,
    localId,
  );

  return row ? toTerrain(row) : null;
}

async function findByRemoteId(remoteId: string): Promise<Terrain | null> {
  const database = await getDatabase();

  const row = await database.getFirstAsync<TerrainRow>(
    `
      SELECT *
      FROM terrains
      WHERE remote_id = ?
      LIMIT 1
    `,
    remoteId,
  );

  return row ? toTerrain(row) : null;
}

async function insert(terrain: Terrain): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      INSERT INTO terrains (
        local_id,
        remote_id,
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    terrain.localId,
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
  );
}

async function update(terrain: Terrain): Promise<void> {
  const database = await getDatabase();

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
      WHERE local_id = ?
    `,
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
    terrain.localId,
  );
}

async function markPendingDelete(
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
      WHERE local_id = ?
    `,
    localUpdatedAt,
    localId,
  );
}

async function deleteByLocalId(localId: string): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      DELETE FROM terrains
      WHERE local_id = ?
    `,
    localId,
  );
}

async function findPending(): Promise<Terrain[]> {
  const database = await getDatabase();

  const rows = await database.getAllAsync<TerrainRow>(
    `
      SELECT *
      FROM terrains
      WHERE sync_status IN (
        'pending_create',
        'pending_update',
        'pending_delete'
      )
      ORDER BY local_updated_at ASC
    `,
  );

  return rows.map(toTerrain);
}

async function setSyncError(localId: string, error: string): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE terrains
      SET last_sync_error = ?
      WHERE local_id = ?
    `,
    error,
    localId,
  );
}

async function markAsSynced(
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
        sync_status = 'synced',
        remote_created_at = ?,
        remote_updated_at = ?,
        last_synced_at = ?,
        last_sync_error = NULL
      WHERE local_id = ?
    `,
    data.remoteId,
    data.name,
    data.restDays,
    data.status,
    data.remoteCreatedAt,
    data.remoteUpdatedAt,
    data.syncedAt,
    localId,
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
};
