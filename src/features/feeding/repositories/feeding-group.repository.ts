import { getDatabase } from '@/infrastructure/database/database';

export interface FeedingGroup { localId: string; remoteId: string | null; name: string; animalCount: number }
export const feedingGroupRepository = {
  async list(accountId: string): Promise<FeedingGroup[]> {
    const db = await getDatabase();
    return db.getAllAsync<FeedingGroup>(`SELECT g.local_id AS localId, g.remote_id AS remoteId, g.name, g.animal_count AS animalCount
      FROM animal_groups g JOIN feeding_group_accounts a ON a.group_local_id = g.local_id
      WHERE a.account_id = ? AND g.sync_status != 'pending_delete'`, [accountId]);
  },
  async bindVerifiedRemote(accountId: string, remoteId: string) {
    const db = await getDatabase();
    await db.runAsync(`INSERT OR IGNORE INTO feeding_group_accounts(group_local_id, account_id)
      SELECT local_id, ? FROM animal_groups WHERE remote_id = ?`, [accountId, remoteId]);
  },
};
