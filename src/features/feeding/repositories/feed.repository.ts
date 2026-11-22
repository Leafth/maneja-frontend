import * as Crypto from 'expo-crypto';
import { feedLocalDataSource } from '../data/local/feed-local-data-source';
import type { Feed } from '../models/feed.model';

import { getDatabase } from '@/infrastructure/database/database';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { RemoteFeedSnapshot } from '../mappers/feed.mapper';

async function feedTransaction<T>(
  work: (tx: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const db = await getDatabase();
  let result!: T;
  await db.withExclusiveTransactionAsync(async (tx) => {
    result = await work(tx);
  });
  return result;
}

async function hasPendingFeedingBalance(
  accountId: string,
  feedLocalId: string,
  db: SQLiteDatabase,
) {
  return !!(await db.getFirstAsync(
    'SELECT 1 FROM feeding_records WHERE account_id = ? AND feed_local_id = ? AND balance_state = \'pending\' LIMIT 1',
    [accountId, feedLocalId],
  ));
}

interface CreateFeedInput {
  accountId: string;
  name: string;
  initialStockScaled: number;
}

class FeedRepository {
  async findAll(accountId: string): Promise<Feed[]> {
    return feedLocalDataSource.findAll(accountId);
  }

  async findByLocalId(
    accountId: string,
    localId: string,
  ): Promise<Feed | null> {
    return feedLocalDataSource.findByLocalId(accountId, localId);
  }

  async findByRemoteId(
    accountId: string,
    remoteId: string,
  ): Promise<Feed | null> {
    return feedLocalDataSource.findByRemoteId(accountId, remoteId);
  }

  async findPending(accountId: string): Promise<Feed[]> {
    return feedLocalDataSource.findPending(accountId);
  }

  async createLocal(input: CreateFeedInput): Promise<Feed> {
    const now = new Date().toISOString();

    const feed: Feed = {
      localId: Crypto.randomUUID(),
      accountId: input.accountId,
      remoteId: null,
      name: input.name,
      initialStockScaled: input.initialStockScaled,
      remoteStockScaled: null,
      projectedStockScaled: input.initialStockScaled,
      dailyRequiredScaled: null,
      daysRemaining: null,
      alertLevel: null,
      syncStatus: 'pending_create',
      localCreatedAt: now,
      localUpdatedAt: now,
      remoteCreatedAt: null,
      remoteUpdatedAt: null,
      lastSyncedAt: null,
      lastSyncError: null,
      locallyDeletedAt: null,
    };

    await feedLocalDataSource.insert(feed);

    return feed;
  }

  async renameLocal(
    accountId: string,
    localId: string,
    name: string,
  ): Promise<Feed> {
    return feedTransaction(async (tx) => {
      const feed = await feedLocalDataSource.findByLocalId(
        accountId,
        localId,
        tx,
      );

      if (!feed) {
        throw new Error('Alimento não encontrado.');
      }

      if (feed.syncStatus === 'pending_delete') {
        throw new Error(
          'Não é possível editar um alimento pendente de exclusão.',
        );
      }

      const updatedFeed: Feed = {
        ...feed,

        name: name.trim(),

        syncStatus:
          feed.syncStatus === 'pending_create'
            ? 'pending_create'
            : 'pending_update',

        localUpdatedAt: new Date().toISOString(),

        lastSyncError: null,
      };

      await feedLocalDataSource.update(updatedFeed, tx);

      return updatedFeed;
    });
  }

  async markPendingDelete(accountId: string, localId: string): Promise<void> {
    return feedTransaction(async (tx) => {
      const feed = await feedLocalDataSource.findByLocalId(
        accountId,
        localId,
        tx,
      );

      if (!feed) {
        return;
      }

      const now = new Date().toISOString();

      await feedLocalDataSource.update(
        {
          ...feed,

          syncStatus: 'pending_delete',

          localUpdatedAt: now,

          lastSyncError: null,
        },
        tx,
      );
    });
  }

  async recordSyncError(
    accountId: string,
    localId: string,
    message: string,
  ): Promise<void> {
    return feedTransaction(async (tx) => {
      const feed = await feedLocalDataSource.findByLocalId(
        accountId,
        localId,
        tx,
      );

      if (!feed) {
        return;
      }

      await feedLocalDataSource.update(
        {
          ...feed,

          lastSyncError: message,
          localUpdatedAt: new Date().toISOString(),
        },
        tx,
      );
    });
  }
  async assignRemoteIdentity(
    accountId: string,
    localId: string,
    snapshot: RemoteFeedSnapshot,
    expectedLocalUpdatedAt: string,
  ): Promise<Feed> {
    return feedTransaction(async (tx) => {
      const current = await feedLocalDataSource.findByLocalId(
        accountId,
        localId,
        tx,
      );

      if (!current) {
        throw new Error('Alimento local não encontrado.');
      }

      const changedWhileSyncing =
        current.localUpdatedAt !== expectedLocalUpdatedAt;

      const now = new Date().toISOString();

      const updated: Feed = {
        ...current,

        remoteId: snapshot.remoteId,

        name: changedWhileSyncing ? current.name : snapshot.name,

        remoteStockScaled: snapshot.remoteStockScaled,

        dailyRequiredScaled: snapshot.dailyRequiredScaled,
        daysRemaining: snapshot.daysRemaining,
        alertLevel: snapshot.alertLevel,

        projectedStockScaled: current.projectedStockScaled,

        syncStatus:
          current.syncStatus === 'pending_delete'
            ? 'pending_delete'
            : changedWhileSyncing
              ? 'pending_update'
              : 'synced',

        remoteCreatedAt: snapshot.remoteCreatedAt,
        remoteUpdatedAt: snapshot.remoteUpdatedAt,

        lastSyncedAt: now,
        lastSyncError: null,
      };

      await feedLocalDataSource.update(updated, tx);

      return updated;
    });
  }

  async confirmRemoteUpdate(
    accountId: string,
    localId: string,
    snapshot: RemoteFeedSnapshot,
    expectedLocalUpdatedAt: string,
  ): Promise<Feed> {
    return feedTransaction(async (tx) => {
      const current = await feedLocalDataSource.findByLocalId(
        accountId,
        localId,
        tx,
      );

      if (!current) {
        throw new Error('Alimento local não encontrado.');
      }

      const changedWhileSyncing =
        current.localUpdatedAt !== expectedLocalUpdatedAt;

      const now = new Date().toISOString();

      const updated: Feed = {
        ...current,

        name: changedWhileSyncing ? current.name : snapshot.name,

        remoteStockScaled: (await hasPendingFeedingBalance(
          accountId,
          localId,
          tx,
        ))
          ? current.remoteStockScaled
          : snapshot.remoteStockScaled,

        syncStatus:
          current.syncStatus === 'pending_delete'
            ? 'pending_delete'
            : changedWhileSyncing
              ? 'pending_update'
              : 'synced',

        remoteUpdatedAt: snapshot.remoteUpdatedAt,

        dailyRequiredScaled: snapshot.dailyRequiredScaled,
        daysRemaining: snapshot.daysRemaining,
        alertLevel: snapshot.alertLevel,

        lastSyncedAt: now,
        lastSyncError: null,
      };

      await feedLocalDataSource.update(updated, tx);

      return updated;
    });
  }

  async confirmRemoteDelete(accountId: string, localId: string): Promise<void> {
    return feedTransaction(async (tx) => {
      const feed = await feedLocalDataSource.findByLocalId(
        accountId,
        localId,
        tx,
      );

      if (!feed) {
        return;
      }

      const now = new Date().toISOString();

      await feedLocalDataSource.update(
        {
          ...feed,

          syncStatus: 'synced',

          locallyDeletedAt: now,

          localUpdatedAt: now,
          lastSyncedAt: now,

          lastSyncError: null,
        },
        tx,
      );
    });
  }

  async mergeRemoteSnapshot(
    accountId: string,
    snapshot: RemoteFeedSnapshot,
  ): Promise<Feed> {
    return feedTransaction(async (tx) => {
      const existing = await feedLocalDataSource.findByRemoteId(
        accountId,
        snapshot.remoteId,
        tx,
      );

      const now = new Date().toISOString();

      /*
       * O Feed existe no servidor, mas ainda não existe
       * neste dispositivo.
       */
      if (!existing) {
        const imported: Feed = {
          localId: Crypto.randomUUID(),
          accountId,

          remoteId: snapshot.remoteId,

          name: snapshot.name,

          /*
           * A API não devolve o saldo inicial depois
           * que o Feed foi criado.
           */
          initialStockScaled: null,

          remoteStockScaled: snapshot.remoteStockScaled,

          projectedStockScaled: snapshot.remoteStockScaled,

          dailyRequiredScaled: snapshot.dailyRequiredScaled,
          daysRemaining: snapshot.daysRemaining,
          alertLevel: snapshot.alertLevel,

          syncStatus: 'synced',

          localCreatedAt: now,
          localUpdatedAt: now,

          remoteCreatedAt: snapshot.remoteCreatedAt,

          remoteUpdatedAt: snapshot.remoteUpdatedAt,

          lastSyncedAt: now,
          lastSyncError: null,

          locallyDeletedAt: null,
        };

        await feedLocalDataSource.insert(imported, tx);

        return imported;
      }

      /*
       * Se o usuário já pediu para excluir localmente,
       * um PULL não deve "ressuscitar" o Feed.
       */
      if (
        existing.syncStatus === 'pending_delete' ||
        existing.locallyDeletedAt
      ) {
        return existing;
      }

      /*
       * Calculamos apenas o efeito que ainda existe
       * na projeção local.
       *
       * Exemplo:
       *
       * remote antigo = 100
       * projected = 130
       *
       * delta local = +30
       *
       * novo remote = 80
       *
       * novo projected = 110
       */
      const projectionBase =
        existing.remoteStockScaled ??
        existing.initialStockScaled ??
        existing.projectedStockScaled;

      const localDelta = existing.projectedStockScaled - projectionBase;
      // A snapshot cannot disambiguate an uncertain Feeding, and confirmed
      // reservations must be incorporated atomically by reconcileBalance.
      const preserveBalance = await hasPendingFeedingBalance(
        accountId,
        existing.localId,
        tx,
      );

      /*
       * Se existe rename local pendente, não deixamos
       * o PULL sobrescrever o nome escolhido pelo usuário.
       */
      const preserveLocalName =
        existing.syncStatus === 'pending_create' ||
        existing.syncStatus === 'pending_update';

      const updated: Feed = {
        ...existing,

        name: preserveLocalName ? existing.name : snapshot.name,

        remoteStockScaled: preserveBalance
          ? existing.remoteStockScaled
          : snapshot.remoteStockScaled,

        projectedStockScaled: preserveBalance
          ? existing.projectedStockScaled
          : snapshot.remoteStockScaled + localDelta,

        remoteCreatedAt: snapshot.remoteCreatedAt,

        remoteUpdatedAt: snapshot.remoteUpdatedAt,

        lastSyncedAt: now,
        lastSyncError: null,
      };

      await feedLocalDataSource.update(updated, tx);

      return updated;
    });
  }
}

export const feedRepository = new FeedRepository();
