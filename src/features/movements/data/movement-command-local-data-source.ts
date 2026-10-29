import {
  getDatabase,
  withDatabaseTransaction,
} from '@/infrastructure/database/database';

import type { MovementCommand, MovementCommandDispatchState } from '../models';

interface MovementCommandRow {
  local_id: string;
  account_id: string;

  remote_id: string | null;

  group_local_id: string;

  origin_terrain_local_id: string | null;
  destination_terrain_local_id: string;

  sequence_number: number;

  sync_status: MovementCommand['syncStatus'];
  dispatch_state: MovementCommandDispatchState;

  local_created_at: string;
  local_updated_at: string;

  remote_started_at: string | null;

  last_synced_at: string | null;
  last_sync_error: string | null;
}

interface CreateOptimisticMovementInput {
  localId: string;
  accountId: string;
  groupLocalId: string;
  destinationTerrainLocalId: string;
  now: string;
}

function toMovementCommand(row: MovementCommandRow): MovementCommand {
  return {
    localId: row.local_id,
    accountId: row.account_id,

    remoteId: row.remote_id,

    groupLocalId: row.group_local_id,

    originTerrainLocalId: row.origin_terrain_local_id,

    destinationTerrainLocalId: row.destination_terrain_local_id,

    sequenceNumber: row.sequence_number,

    syncStatus: row.sync_status,
    dispatchState: row.dispatch_state,

    localCreatedAt: row.local_created_at,
    localUpdatedAt: row.local_updated_at,

    remoteStartedAt: row.remote_started_at,

    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,
  };
}

async function insert(movement: MovementCommand): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      INSERT INTO movement_commands (
        local_id,
        account_id,
        remote_id,
        group_local_id,
        origin_terrain_local_id,
        destination_terrain_local_id,
        sequence_number,
        sync_status,
        dispatch_state,
        local_created_at,
        local_updated_at,
        remote_started_at,
        last_synced_at,
        last_sync_error
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    movement.localId,
    movement.accountId,
    movement.remoteId,
    movement.groupLocalId,
    movement.originTerrainLocalId,
    movement.destinationTerrainLocalId,
    movement.sequenceNumber,
    movement.syncStatus,
    movement.dispatchState,
    movement.localCreatedAt,
    movement.localUpdatedAt,
    movement.remoteStartedAt,
    movement.lastSyncedAt,
    movement.lastSyncError,
  );
}

async function findQueued(accountId: string): Promise<MovementCommand[]> {
  const database = await getDatabase();

  const rows = await database.getAllAsync<MovementCommandRow>(
    `
        SELECT *
        FROM movement_commands
        WHERE account_id = ?
          AND sync_status = 'pending_create'
          AND dispatch_state = 'queued'
        ORDER BY
          group_local_id ASC,
          sequence_number ASC
      `,
    accountId,
  );

  return rows.map(toMovementCommand);
}

async function getNextSequenceNumber(
  accountId: string,
  groupLocalId: string,
): Promise<number> {
  const database = await getDatabase();

  const row = await database.getFirstAsync<{
    next_sequence: number;
  }>(
    `
      SELECT
        COALESCE(MAX(sequence_number), 0) + 1 AS next_sequence
      FROM movement_commands
      WHERE account_id = ?
        AND group_local_id = ?
    `,
    accountId,
    groupLocalId,
  );

  return row?.next_sequence ?? 1;
}

async function updateDispatchState(
  localId: string,
  dispatchState: MovementCommandDispatchState,
  error: string | null = null,
): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE movement_commands
      SET
        dispatch_state = ?,
        local_updated_at = ?,
        last_sync_error = ?
      WHERE local_id = ?
    `,
    dispatchState,
    new Date().toISOString(),
    error,
    localId,
  );
}

async function markConfirmed(
  localId: string,
  data: {
    remoteId: string;
    remoteStartedAt: string;
  },
): Promise<void> {
  const database = await getDatabase();

  const now = new Date().toISOString();

  await database.runAsync(
    `
      UPDATE movement_commands
      SET
        remote_id = ?,
        sync_status = 'synced',
        dispatch_state = 'confirmed',
        remote_started_at = ?,
        local_updated_at = ?,
        last_synced_at = ?,
        last_sync_error = NULL
      WHERE local_id = ?
    `,
    data.remoteId,
    data.remoteStartedAt,
    now,
    now,
    localId,
  );
}

async function markSendingAsUncertain(accountId: string): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE movement_commands
      SET
        dispatch_state = 'uncertain',
        local_updated_at = ?,
        last_sync_error =
          'Sincronização interrompida antes da confirmação.'
      WHERE account_id = ?
        AND sync_status = 'pending_create'
        AND dispatch_state = 'sending'
    `,
    new Date().toISOString(),
    accountId,
  );
}

export const movementCommandLocalDataSource = {
  insert,

  findQueued,
  getNextSequenceNumber,

  updateDispatchState,
  markConfirmed,

  createOptimistic,

  markSendingAsUncertain,
};

async function createOptimistic(
  input: CreateOptimisticMovementInput,
): Promise<MovementCommand> {
  return withDatabaseTransaction(async (database) => {
    const group = await database.getFirstAsync<{
      remote_id: string | null;
      name: string;
      current_terrain_local_id: string | null;
      current_terrain_remote_id: string | null;
    }>(
      `
        SELECT
          remote_id,
          name,
          current_terrain_local_id,
          current_terrain_remote_id
        FROM animal_groups
        WHERE local_id = ?
      `,
      [input.groupLocalId],
    );

    if (!group) {
      throw new Error('Grupo não encontrado.');
    }

    const destination = await database.getFirstAsync<{
      local_id: string;
      remote_id: string | null;
      name: string;
      rest_days: number;
      status: 'available' | 'occupied' | 'resting';
    }>(
      `
        SELECT local_id, remote_id, name, rest_days, status
        FROM terrains
        WHERE local_id = ?
          AND sync_status != 'pending_delete'
      `,
      [input.destinationTerrainLocalId],
    );

    if (!destination) {
      throw new Error('Terreno de destino não encontrado.');
    }

    if (destination.status === 'occupied') {
      throw new Error('O terreno de destino está ocupado.');
    }

    let originTerrainLocalId = group.current_terrain_local_id;

    if (!originTerrainLocalId && group.current_terrain_remote_id) {
      const origin = await database.getFirstAsync<{
        local_id: string;
      }>(
        `
          SELECT local_id
          FROM terrains
          WHERE remote_id = ?
          LIMIT 1
        `,
        [group.current_terrain_remote_id],
      );

      originTerrainLocalId = origin?.local_id ?? null;
    }

    if (originTerrainLocalId === destination.local_id) {
      throw new Error('O grupo já está neste terreno.');
    }

    const sequence = await database.getFirstAsync<{
      next_sequence: number;
    }>(
      `
        SELECT
          COALESCE(MAX(sequence_number), 0) + 1
            AS next_sequence
        FROM movement_commands
        WHERE account_id = ?
          AND group_local_id = ?
      `,
      [input.accountId, input.groupLocalId],
    );

    const command: MovementCommand = {
      localId: input.localId,
      accountId: input.accountId,

      remoteId: null,

      groupLocalId: input.groupLocalId,

      originTerrainLocalId,
      destinationTerrainLocalId: destination.local_id,

      sequenceNumber: sequence?.next_sequence ?? 1,

      syncStatus: 'pending_create',
      dispatchState: 'queued',

      localCreatedAt: input.now,
      localUpdatedAt: input.now,

      remoteStartedAt: null,

      lastSyncedAt: null,
      lastSyncError: null,
    };

    await database.runAsync(
      `
        INSERT INTO movement_commands (
          local_id,
          account_id,
          remote_id,
          group_local_id,
          origin_terrain_local_id,
          destination_terrain_local_id,
          sequence_number,
          sync_status,
          dispatch_state,
          local_created_at,
          local_updated_at,
          remote_started_at,
          last_synced_at,
          last_sync_error
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        command.localId,
        command.accountId,
        command.remoteId,
        command.groupLocalId,
        command.originTerrainLocalId,
        command.destinationTerrainLocalId,
        command.sequenceNumber,
        command.syncStatus,
        command.dispatchState,
        command.localCreatedAt,
        command.localUpdatedAt,
        command.remoteStartedAt,
        command.lastSyncedAt,
        command.lastSyncError,
      ],
    );

    await database.runAsync(
      `
        UPDATE occupations
        SET ended_at = ?
        WHERE group_local_id = ?
          AND ended_at IS NULL
      `,
      [input.now, input.groupLocalId],
    );

    /*
     * A nova ocupação local nasce junto com o comando de movimento.
     * O remote_id e o horário oficial são reconciliados após o sync.
     */
    await database.runAsync(
      `
        INSERT INTO occupations (
          local_id,
          remote_id,
          account_id,
          group_local_id,
          group_remote_id,
          group_name,
          terrain_local_id,
          terrain_remote_id,
          terrain_name,
          started_at,
          ended_at,
          movement_command_local_id,
          source
        )
        VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 'local')
      `,
      [
        command.localId,
        command.accountId,
        command.groupLocalId,
        group.remote_id,
        group.name,
        destination.local_id,
        destination.remote_id,
        destination.name,
        input.now,
        command.localId,
      ],
    );

    /*
     * O destino passa a estar ocupado
     * imediatamente no SQLite.
     */
    await database.runAsync(
      `
        UPDATE terrains
        SET
          status = 'occupied',
          local_updated_at = ?
        WHERE local_id = ?
      `,
      [input.now, destination.local_id],
    );

    /*
     * A origem entra em descanso ou fica
     * disponível imediatamente.
     */
    if (originTerrainLocalId) {
      const origin = await database.getFirstAsync<{
        rest_days: number;
      }>(
        `
            SELECT rest_days
            FROM terrains
            WHERE local_id = ?
          `,
        [originTerrainLocalId],
      );

      if (origin) {
        const originStatus = origin.rest_days > 0 ? 'resting' : 'available';

        await database.runAsync(
          `
            UPDATE terrains
            SET
              status = ?,
              local_updated_at = ?
            WHERE local_id = ?
          `,
          [originStatus, input.now, originTerrainLocalId],
        );
      }
    }

    /*
     * Atualiza a localização atual do grupo
     * sem alterar sync_status do CRUD do grupo.
     */
    await database.runAsync(
      `
        UPDATE animal_groups
        SET
          current_terrain_local_id = ?,
          current_terrain_remote_id = ?,
          current_terrain_name = ?,
          local_updated_at = ?
        WHERE local_id = ?
      `,
      [
        destination.local_id,
        destination.remote_id,
        destination.name,
        input.now,
        input.groupLocalId,
      ],
    );

    return command;
  });
}
