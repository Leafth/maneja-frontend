import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/infrastructure/database/database';

import type {
  FeedEntry,
  FeedExit,
  FeedMovement,
} from '../../models/feed-movement.model';

type DatabaseExecutor = Pick<
  SQLiteDatabase,
  'getFirstAsync' | 'getAllAsync' | 'runAsync'
>;

type MovementType = 'entry' | 'exit';

type MovementSyncStatus = 'pending_create' | 'synced';

type DispatchState =
  | 'queued'
  | 'sending'
  | 'uncertain'
  | 'rejected'
  | 'confirmed';

type BalanceState = 'pending' | 'incorporated';

interface FeedMovementRow {
  local_id: string;
  account_id: string;

  remote_id: string | null;

  feed_local_id: string;

  movement_type: MovementType;

  quantity_scaled: number;

  value_scaled: number | null;
  reason: string | null;

  occurred_on: string;

  sequence_number: number;

  sync_status: MovementSyncStatus;
  dispatch_state: DispatchState;
  balance_state: BalanceState;

  local_created_at: string;
  local_updated_at: string;

  remote_created_at: string | null;
  remote_updated_at: string | null;

  last_synced_at: string | null;
  last_sync_error: string | null;
}

async function resolveDatabase(
  executor?: DatabaseExecutor,
): Promise<DatabaseExecutor> {
  return executor ?? getDatabase();
}

function mapRowToMovement(row: FeedMovementRow): FeedMovement {
  const base = {
    localId: row.local_id,
    accountId: row.account_id,

    remoteId: row.remote_id,

    feedLocalId: row.feed_local_id,

    quantityScaled: row.quantity_scaled,
    occurredOn: row.occurred_on,

    sequenceNumber: row.sequence_number,

    syncStatus: row.sync_status,
    dispatchState: row.dispatch_state,
    balanceState: row.balance_state,

    localCreatedAt: row.local_created_at,
    localUpdatedAt: row.local_updated_at,

    remoteCreatedAt: row.remote_created_at,
    remoteUpdatedAt: row.remote_updated_at,

    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,
  };

  if (row.movement_type === 'entry') {
    if (row.value_scaled === null) {
      throw new Error(`Movimentação de entrada ${row.local_id} sem valor.`);
    }

    return {
      ...base,

      movementType: 'entry',

      valueScaled: row.value_scaled,
      reason: null,
    } satisfies FeedEntry;
  }

  if (!row.reason) {
    throw new Error(`Movimentação de saída ${row.local_id} sem motivo.`);
  }

  return {
    ...base,

    movementType: 'exit',

    valueScaled: null,
    reason: row.reason,
  } satisfies FeedExit;
}

class FeedMovementLocalDataSource {
  async findByLocalId(
    accountId: string,
    localId: string,
    executor?: DatabaseExecutor,
  ): Promise<FeedMovement | null> {
    const db = await resolveDatabase(executor);

    const row = await db.getFirstAsync<FeedMovementRow>(
      `
          SELECT *
          FROM feed_movements
          WHERE account_id = ?
            AND local_id = ?
          LIMIT 1
        `,
      accountId,
      localId,
    );

    return row ? mapRowToMovement(row) : null;
  }

  async findByRemoteId(
    accountId: string,
    remoteId: string,
    executor?: DatabaseExecutor,
  ): Promise<FeedMovement | null> {
    const db = await resolveDatabase(executor);

    const row = await db.getFirstAsync<FeedMovementRow>(
      `
          SELECT *
          FROM feed_movements
          WHERE account_id = ?
            AND remote_id = ?
          LIMIT 1
        `,
      accountId,
      remoteId,
    );

    return row ? mapRowToMovement(row) : null;
  }

  async findByFeedLocalId(
    accountId: string,
    feedLocalId: string,
    executor?: DatabaseExecutor,
  ): Promise<FeedMovement[]> {
    const db = await resolveDatabase(executor);

    const rows = await db.getAllAsync<FeedMovementRow>(
      `
          SELECT *
          FROM feed_movements
          WHERE account_id = ?
            AND feed_local_id = ?
          ORDER BY
            occurred_on DESC,
            local_created_at DESC
        `,
      accountId,
      feedLocalId,
    );

    return rows.map(mapRowToMovement);
  }

  async findPendingByFeedLocalId(
    accountId: string,
    feedLocalId: string,
    executor?: DatabaseExecutor,
  ): Promise<FeedMovement[]> {
    const db = await resolveDatabase(executor);

    const rows = await db.getAllAsync<FeedMovementRow>(
      `
          SELECT *
          FROM feed_movements
          WHERE account_id = ?
            AND feed_local_id = ?
            AND sync_status = 'pending_create'
          ORDER BY sequence_number ASC
        `,
      accountId,
      feedLocalId,
    );

    return rows.map(mapRowToMovement);
  }

  async findQueuedByFeedLocalId(
    accountId: string,
    feedLocalId: string,
    executor?: DatabaseExecutor,
  ): Promise<FeedMovement[]> {
    const db = await resolveDatabase(executor);

    const rows = await db.getAllAsync<FeedMovementRow>(
      `
          SELECT *
          FROM feed_movements
          WHERE account_id = ?
            AND feed_local_id = ?
            AND sync_status = 'pending_create'
            AND dispatch_state = 'queued'
          ORDER BY sequence_number ASC
        `,
      accountId,
      feedLocalId,
    );

    return rows.map(mapRowToMovement);
  }

  async getNextSequenceNumber(
    accountId: string,
    feedLocalId: string,
    executor?: DatabaseExecutor,
  ): Promise<number> {
    const db = await resolveDatabase(executor);

    const row = await db.getFirstAsync<{
      next_sequence: number;
    }>(
      `
        SELECT
          COALESCE(MAX(sequence_number), 0) + 1
            AS next_sequence
        FROM feed_movements
        WHERE account_id = ?
          AND feed_local_id = ?
      `,
      accountId,
      feedLocalId,
    );

    return row?.next_sequence ?? 1;
  }

  async insert(
    movement: FeedMovement,
    executor?: DatabaseExecutor,
  ): Promise<void> {
    const db = await resolveDatabase(executor);

    await db.runAsync(
      `
        INSERT INTO feed_movements (
          local_id,
          account_id,
          remote_id,
          feed_local_id,
          movement_type,
          quantity_scaled,
          value_scaled,
          reason,
          occurred_on,
          sequence_number,
          sync_status,
          dispatch_state,
          balance_state,
          local_created_at,
          local_updated_at,
          remote_created_at,
          remote_updated_at,
          last_synced_at,
          last_sync_error
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `,
      movement.localId,
      movement.accountId,
      movement.remoteId,
      movement.feedLocalId,
      movement.movementType,
      movement.quantityScaled,
      movement.movementType === 'entry' ? movement.valueScaled : null,
      movement.movementType === 'exit' ? movement.reason : null,
      movement.occurredOn,
      movement.sequenceNumber,
      movement.syncStatus,
      movement.dispatchState,
      movement.balanceState,
      movement.localCreatedAt,
      movement.localUpdatedAt,
      movement.remoteCreatedAt,
      movement.remoteUpdatedAt,
      movement.lastSyncedAt,
      movement.lastSyncError,
    );
  }

  async update(
    movement: FeedMovement,
    executor?: DatabaseExecutor,
  ): Promise<void> {
    const db = await resolveDatabase(executor);

    await db.runAsync(
      `
        UPDATE feed_movements
        SET
          remote_id = ?,
          quantity_scaled = ?,
          value_scaled = ?,
          reason = ?,
          occurred_on = ?,
          sequence_number = ?,
          sync_status = ?,
          dispatch_state = ?,
          balance_state = ?,
          local_updated_at = ?,
          remote_created_at = ?,
          remote_updated_at = ?,
          last_synced_at = ?,
          last_sync_error = ?
        WHERE account_id = ?
          AND local_id = ?
      `,
      movement.remoteId,
      movement.quantityScaled,
      movement.movementType === 'entry' ? movement.valueScaled : null,
      movement.movementType === 'exit' ? movement.reason : null,
      movement.occurredOn,
      movement.sequenceNumber,
      movement.syncStatus,
      movement.dispatchState,
      movement.balanceState,
      movement.localUpdatedAt,
      movement.remoteCreatedAt,
      movement.remoteUpdatedAt,
      movement.lastSyncedAt,
      movement.lastSyncError,
      movement.accountId,
      movement.localId,
    );
  }

  async deleteByLocalId(
    accountId: string,
    localId: string,
    executor?: DatabaseExecutor,
  ): Promise<void> {
    const db = await resolveDatabase(executor);

    await db.runAsync(
      `
        DELETE FROM feed_movements
        WHERE account_id = ?
          AND local_id = ?
      `,
      accountId,
      localId,
    );
  }

  async deleteByFeedLocalId(
    accountId: string,
    feedLocalId: string,
    executor?: DatabaseExecutor,
  ): Promise<void> {
    const db = await resolveDatabase(executor);

    await db.runAsync(
      `
        DELETE FROM feed_movements
        WHERE account_id = ?
          AND feed_local_id = ?
      `,
      accountId,
      feedLocalId,
    );
  }
}

export const feedMovementLocalDataSource = new FeedMovementLocalDataSource();
