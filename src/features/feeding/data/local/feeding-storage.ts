import type { SQLiteDatabase, SQLiteBindValue } from 'expo-sqlite';
import { getDatabase } from '@/infrastructure/database/database';

export type FeedingExecutor = Pick<SQLiteDatabase, 'getFirstAsync' | 'getAllAsync' | 'runAsync'>;

/** Only fixed, internal table/field names are accepted by the callers. */
export function createFeedingStore<T extends { accountId: string; localId: string }>(
  table: 'feed_requirements' | 'feeding_records',
  fields: Record<keyof T, string>,
  values: (model: T) => SQLiteBindValue[],
) {
  const keys = Object.keys(fields) as (keyof T)[];
  const columns = keys.map(key => fields[key]);
  const selection = keys.map(key => `${fields[key]} AS ${String(key)}`).join(', ');
  return {
    async list(accountId: string, clause = '', params: SQLiteBindValue[] = [], executor?: FeedingExecutor): Promise<T[]> {
      const db = executor ?? await getDatabase();
      return db.getAllAsync<T>(`SELECT ${selection} FROM ${table} WHERE account_id = ? ${clause}`, [accountId, ...params]);
    },
    async find(accountId: string, localId: string, executor?: FeedingExecutor): Promise<T | null> {
      const db = executor ?? await getDatabase();
      return db.getFirstAsync<T>(`SELECT ${selection} FROM ${table} WHERE account_id = ? AND local_id = ?`, [accountId, localId]);
    },
    async insert(model: T, executor?: FeedingExecutor) {
      const db = executor ?? await getDatabase();
      await db.runAsync(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`, values(model));
    },
    async update(model: T, executor?: FeedingExecutor) {
      const db = executor ?? await getDatabase();
      await db.runAsync(`UPDATE ${table} SET ${columns.map(c => `${c} = ?`).join(',')} WHERE account_id = ? AND local_id = ?`, [...values(model), model.accountId, model.localId]);
    },
    async remove(accountId: string, localId: string, executor?: FeedingExecutor) {
      const db = executor ?? await getDatabase();
      await db.runAsync(`DELETE FROM ${table} WHERE account_id = ? AND local_id = ?`, [accountId, localId]);
    },
  };
}

export const commonFeedingFields = {
  localId: 'local_id', remoteId: 'remote_id', accountId: 'account_id',
  groupLocalId: 'group_local_id', feedLocalId: 'feed_local_id',
  syncStatus: 'sync_status', dispatchState: 'dispatch_state',
  localCreatedAt: 'local_created_at', localUpdatedAt: 'local_updated_at',
  remoteCreatedAt: 'remote_created_at', remoteUpdatedAt: 'remote_updated_at',
  lastSyncedAt: 'last_synced_at', lastSyncError: 'last_sync_error', lastSyncHttpStatus: 'last_sync_http_status',
};

export async function validateFeedingParents(db: FeedingExecutor, accountId: string, groupLocalId: string, feedLocalId: string) {
  const group = await db.getFirstAsync<{ local_id: string }>(`
    SELECT g.local_id FROM animal_groups g JOIN feeding_group_accounts a ON a.group_local_id = g.local_id
    WHERE a.account_id = ? AND g.local_id = ? AND g.sync_status != 'pending_delete'`, [accountId, groupLocalId]);
  if (!group) {throw new Error('Grupo indisponível nesta conta. Conecte-se para verificar o vínculo do grupo.');}
  const feed = await db.getFirstAsync<{ projected_stock_scaled: number }>(`
    SELECT projected_stock_scaled FROM feeds WHERE account_id = ? AND local_id = ?
    AND sync_status != 'pending_delete' AND locally_deleted_at IS NULL`, [accountId, feedLocalId]);
  if (!feed) {throw new Error('Ração indisponível nesta conta.');}
  return feed;
}

export function validateScaledQuantity(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0) {throw new Error('Informe uma quantidade positiva com até duas casas decimais.');}
}
