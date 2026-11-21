import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/infrastructure/database/database';

import type { Feed, FeedSyncStatus } from '../../models/feed.model';

type DatabaseExecutor = Pick<
  SQLiteDatabase,
  'getFirstAsync' | 'getAllAsync' | 'runAsync'
>;

interface FeedRow {
  local_id: string;
  account_id: string;

  remote_id: string | null;

  name: string;

  initial_stock_scaled: number | null;
  remote_stock_scaled: number | null;
  projected_stock_scaled: number;

  sync_status: FeedSyncStatus;

  local_created_at: string;
  local_updated_at: string;

  remote_created_at: string | null;
  remote_updated_at: string | null;

  last_synced_at: string | null;
  last_sync_error: string | null;
  locally_deleted_at: string | null;
}

async function resolveDatabase(
  executor?: DatabaseExecutor,
): Promise<DatabaseExecutor> {
  return executor ?? getDatabase();
}

function mapRowToFeed(row: FeedRow): Feed {
  return {
    localId: row.local_id,
    accountId: row.account_id,
    remoteId: row.remote_id,
    name: row.name,
    initialStockScaled: row.initial_stock_scaled,
    remoteStockScaled: row.remote_stock_scaled,
    projectedStockScaled: row.projected_stock_scaled,
    syncStatus: row.sync_status,
    localCreatedAt: row.local_created_at,
    localUpdatedAt: row.local_updated_at,
    remoteCreatedAt: row.remote_created_at,
    remoteUpdatedAt: row.remote_updated_at,
    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,
    locallyDeletedAt: row.locally_deleted_at,
  };
}

class FeedLocalDataSource {
  async findAll(
    accountId: string,
    executor?: DatabaseExecutor,
  ): Promise<Feed[]> {
    const db = await resolveDatabase(executor);

    const rows = await db.getAllAsync<FeedRow>(
      `
        SELECT *
        FROM feeds
        WHERE account_id = ?
        ORDER BY local_updated_at DESC
      `,
      accountId,
    );

    return rows.map(mapRowToFeed);
  }

  async findByLocalId(
    accountId: string,
    localId: string,
    executor?: DatabaseExecutor,
  ): Promise<Feed | null> {
    const db = await resolveDatabase(executor);

    const row = await db.getFirstAsync<FeedRow>(
      `
        SELECT *
        FROM feeds
        WHERE account_id = ?
          AND local_id = ?
        LIMIT 1
      `,
      accountId,
      localId,
    );

    return row ? mapRowToFeed(row) : null;
  }

  async findByRemoteId(
    accountId: string,
    remoteId: string,
    executor?: DatabaseExecutor,
  ): Promise<Feed | null> {
    const db = await resolveDatabase(executor);

    const row = await db.getFirstAsync<FeedRow>(
      `
        SELECT *
        FROM feeds
        WHERE account_id = ?
          AND remote_id = ?
        LIMIT 1
      `,
      accountId,
      remoteId,
    );

    return row ? mapRowToFeed(row) : null;
  }

  async findPending(
    accountId: string,
    executor?: DatabaseExecutor,
  ): Promise<Feed[]> {
    const db = await resolveDatabase(executor);

    const rows = await db.getAllAsync<FeedRow>(
      `
        SELECT *
        FROM feeds
        WHERE account_id = ?
          AND sync_status != 'synced'
        ORDER BY local_created_at ASC
      `,
      accountId,
    );

    return rows.map(mapRowToFeed);
  }

  async insert(feed: Feed, executor?: DatabaseExecutor): Promise<void> {
    const db = await resolveDatabase(executor);

    await db.runAsync(
      `
        INSERT INTO feeds (
          local_id,
          account_id,
          remote_id,
          name,
          initial_stock_scaled,
          remote_stock_scaled,
          projected_stock_scaled,
          sync_status,
          local_created_at,
          local_updated_at,
          remote_created_at,
          remote_updated_at,
          last_synced_at,
          last_sync_error,
          locally_deleted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      feed.localId,
      feed.accountId,
      feed.remoteId,
      feed.name,
      feed.initialStockScaled,
      feed.remoteStockScaled,
      feed.projectedStockScaled,
      feed.syncStatus,
      feed.localCreatedAt,
      feed.localUpdatedAt,
      feed.remoteCreatedAt,
      feed.remoteUpdatedAt,
      feed.lastSyncedAt,
      feed.lastSyncError,
      feed.locallyDeletedAt,
    );
  }

  async update(feed: Feed, executor?: DatabaseExecutor): Promise<void> {
    const db = await resolveDatabase(executor);

    await db.runAsync(
      `
        UPDATE feeds
        SET
          remote_id = ?,
          name = ?,
          initial_stock_scaled = ?,
          remote_stock_scaled = ?,
          projected_stock_scaled = ?,
          sync_status = ?,
          local_updated_at = ?,
          remote_created_at = ?,
          remote_updated_at = ?,
          last_synced_at = ?,
          last_sync_error = ?,
          locally_deleted_at = ?
        WHERE account_id = ?
          AND local_id = ?
      `,
      feed.remoteId,
      feed.name,
      feed.initialStockScaled,
      feed.remoteStockScaled,
      feed.projectedStockScaled,
      feed.syncStatus,
      feed.localUpdatedAt,
      feed.remoteCreatedAt,
      feed.remoteUpdatedAt,
      feed.lastSyncedAt,
      feed.lastSyncError,
      feed.locallyDeletedAt,
      feed.accountId,
      feed.localId,
    );
  }

  async updateProjectedStock(
    accountId: string,
    localId: string,
    projectedStockScaled: number,
    localUpdatedAt: string,
    executor?: DatabaseExecutor,
  ): Promise<void> {
    const db = await resolveDatabase(executor);

    await db.runAsync(
      `
        UPDATE feeds
        SET
          projected_stock_scaled = ?,
          local_updated_at = ?
        WHERE account_id = ?
          AND local_id = ?
      `,
      projectedStockScaled,
      localUpdatedAt,
      accountId,
      localId,
    );
  }

  async updateSyncStatus(
    accountId: string,
    localId: string,
    syncStatus: FeedSyncStatus,
    localUpdatedAt: string,
    executor?: DatabaseExecutor,
  ): Promise<void> {
    const db = await resolveDatabase(executor);

    await db.runAsync(
      `
        UPDATE feeds
        SET
          sync_status = ?,
          local_updated_at = ?
        WHERE account_id = ?
          AND local_id = ?
      `,
      syncStatus,
      localUpdatedAt,
      accountId,
      localId,
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
        DELETE FROM feeds
        WHERE account_id = ?
          AND local_id = ?
      `,
      accountId,
      localId,
    );
  }
}

export const feedLocalDataSource = new FeedLocalDataSource();
