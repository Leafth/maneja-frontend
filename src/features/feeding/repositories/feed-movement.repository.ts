import { getDatabase } from '@/infrastructure/database/database';

import { feedLocalDataSource } from '../data/local/feed-local-data-source';
import { feedMovementLocalDataSource } from '../data/local/feed-movement-local-data-source';

import * as Crypto from 'expo-crypto';

import type {
  FeedEntry,
  FeedExit,
  FeedMovement,
} from '../models/feed-movement.model';

interface CreateEntryInput {
  accountId: string;

  feedLocalId: string;

  quantityScaled: number;
  valueScaled: number;

  occurredOn: string;
}

interface CreateExitInput {
  accountId: string;

  feedLocalId: string;

  quantityScaled: number;

  reason: string;

  occurredOn: string;
}

interface ConfirmMovementInput {
  accountId: string;
  localId: string;

  remoteId: string;

  remoteCreatedAt: string;
  remoteUpdatedAt: string;
}

interface ReconcileBalanceInput {
  accountId: string;
  feedLocalId: string;

  remoteStockScaled: number;
  remoteUpdatedAt: string;
}

class FeedMovementRepository {
  async findByFeedLocalId(
    accountId: string,
    feedLocalId: string,
  ): Promise<FeedMovement[]> {
    return feedMovementLocalDataSource.findByFeedLocalId(
      accountId,
      feedLocalId,
    );
  }

  async findPendingByFeedLocalId(
    accountId: string,
    feedLocalId: string,
  ): Promise<FeedMovement[]> {
    return feedMovementLocalDataSource.findPendingByFeedLocalId(
      accountId,
      feedLocalId,
    );
  }

  async findQueuedByFeedLocalId(
    accountId: string,
    feedLocalId: string,
  ): Promise<FeedMovement[]> {
    return feedMovementLocalDataSource.findQueuedByFeedLocalId(
      accountId,
      feedLocalId,
    );
  }

  async markSending(accountId: string, localId: string): Promise<FeedMovement> {
    const movement = await feedMovementLocalDataSource.findByLocalId(
      accountId,
      localId,
    );

    if (!movement) {
      throw new Error('Movimentação não encontrada.');
    }

    const updated: FeedMovement = {
      ...movement,

      dispatchState: 'sending',

      localUpdatedAt: new Date().toISOString(),

      lastSyncError: null,
    };

    await feedMovementLocalDataSource.update(updated);

    return updated;
  }

  async markConfirmed(input: ConfirmMovementInput): Promise<FeedMovement> {
    const movement = await feedMovementLocalDataSource.findByLocalId(
      input.accountId,
      input.localId,
    );

    if (!movement) {
      throw new Error('Movimentação não encontrada.');
    }

    const now = new Date().toISOString();

    const updated: FeedMovement = {
      ...movement,

      remoteId: input.remoteId,

      syncStatus: 'synced',
      dispatchState: 'confirmed',

      balanceState: movement.balanceState,

      remoteCreatedAt: input.remoteCreatedAt,
      remoteUpdatedAt: input.remoteUpdatedAt,

      localUpdatedAt: now,
      lastSyncedAt: now,

      lastSyncError: null,
    };

    await feedMovementLocalDataSource.update(updated);

    return updated;
  }

  async markQueued(
    accountId: string,
    localId: string,
    message: string | null = null,
  ): Promise<FeedMovement> {
    const movement = await feedMovementLocalDataSource.findByLocalId(
      accountId,
      localId,
    );

    if (!movement) {
      throw new Error('Movimentação não encontrada.');
    }

    const updated: FeedMovement = {
      ...movement,

      syncStatus: 'pending_create',
      dispatchState: 'queued',

      localUpdatedAt: new Date().toISOString(),

      lastSyncError: message,
    };

    await feedMovementLocalDataSource.update(updated);

    return updated;
  }

  async markRejected(
    accountId: string,
    localId: string,
    message: string,
  ): Promise<FeedMovement> {
    const movement = await feedMovementLocalDataSource.findByLocalId(
      accountId,
      localId,
    );

    if (!movement) {
      throw new Error('Movimentação não encontrada.');
    }

    const updated: FeedMovement = {
      ...movement,

      syncStatus: 'pending_create',
      dispatchState: 'rejected',

      localUpdatedAt: new Date().toISOString(),

      lastSyncError: message,
    };

    await feedMovementLocalDataSource.update(updated);

    return updated;
  }

  async markUncertain(
    accountId: string,
    localId: string,
    message: string,
  ): Promise<FeedMovement> {
    const movement = await feedMovementLocalDataSource.findByLocalId(
      accountId,
      localId,
    );

    if (!movement) {
      throw new Error('Movimentação não encontrada.');
    }

    const updated: FeedMovement = {
      ...movement,

      syncStatus: 'pending_create',
      dispatchState: 'uncertain',

      localUpdatedAt: new Date().toISOString(),

      lastSyncError: message,
    };

    await feedMovementLocalDataSource.update(updated);

    return updated;
  }

  async reconcileBalance(input: ReconcileBalanceInput): Promise<void> {
    const db = await getDatabase();

    await db.withExclusiveTransactionAsync(async (transaction) => {
      const feed = await feedLocalDataSource.findByLocalId(
        input.accountId,
        input.feedLocalId,
        transaction,
      );

      if (!feed) {
        throw new Error('Alimento não encontrado.');
      }

      const movements = await feedMovementLocalDataSource.findByFeedLocalId(
        input.accountId,
        input.feedLocalId,
        transaction,
      );

      const now = new Date().toISOString();

      let pendingDelta = 0;

      for (const movement of movements) {
        if (movement.balanceState !== 'pending') {
          continue;
        }

        /*
         * Se o movimento já foi confirmado pelo servidor,
         * o novo remoteStockScaled já contém seu efeito.
         *
         * Portanto, marcamos como incorporado e NÃO
         * adicionamos novamente ao saldo projetado.
         */
        if (
          movement.syncStatus === 'synced' &&
          movement.dispatchState === 'confirmed'
        ) {
          await feedMovementLocalDataSource.update(
            {
              ...movement,

              balanceState: 'incorporated',

              localUpdatedAt: now,
              lastSyncedAt: now,
            },
            transaction,
          );

          continue;
        }

        /*
         * Movimentos ainda não incorporados pelo servidor
         * continuam fazendo parte da projeção local.
         */
        if (movement.movementType === 'entry') {
          pendingDelta += movement.quantityScaled;
        } else {
          pendingDelta -= movement.quantityScaled;
        }
      }

      const projectedStockScaled = input.remoteStockScaled + pendingDelta;

      await feedLocalDataSource.update(
        {
          ...feed,

          remoteStockScaled: input.remoteStockScaled,

          projectedStockScaled,

          remoteUpdatedAt: input.remoteUpdatedAt,

          localUpdatedAt: now,
          lastSyncedAt: now,

          lastSyncError: null,
        },
        transaction,
      );
    });
  }

  async createEntryLocal(input: CreateEntryInput): Promise<FeedEntry> {
    const db = await getDatabase();

    let createdMovement: FeedEntry | null = null;

    await db.withExclusiveTransactionAsync(async (transaction) => {
      const feed = await feedLocalDataSource.findByLocalId(
        input.accountId,
        input.feedLocalId,
        transaction,
      );

      if (!feed) {
        throw new Error('Alimento não encontrado.');
      }

      if (feed.syncStatus === 'pending_delete') {
        throw new Error(
          'Não é possível movimentar um alimento pendente de exclusão.',
        );
      }

      if (input.quantityScaled <= 0) {
        throw new Error('A quantidade deve ser maior que zero.');
      }

      if (input.valueScaled < 0) {
        throw new Error('O valor não pode ser negativo.');
      }

      const sequenceNumber =
        await feedMovementLocalDataSource.getNextSequenceNumber(
          input.accountId,
          input.feedLocalId,
          transaction,
        );

      const now = new Date().toISOString();

      const movement: FeedEntry = {
        localId: Crypto.randomUUID(),

        accountId: input.accountId,

        remoteId: null,

        feedLocalId: input.feedLocalId,

        movementType: 'entry',

        quantityScaled: input.quantityScaled,

        valueScaled: input.valueScaled,

        reason: null,

        occurredOn: input.occurredOn,

        sequenceNumber,

        syncStatus: 'pending_create',

        dispatchState: 'queued',

        balanceState: 'pending',

        localCreatedAt: now,
        localUpdatedAt: now,

        remoteCreatedAt: null,
        remoteUpdatedAt: null,

        lastSyncedAt: null,
        lastSyncError: null,
      };

      await feedMovementLocalDataSource.insert(movement, transaction);

      await feedLocalDataSource.updateProjectedStock(
        input.accountId,
        input.feedLocalId,

        feed.projectedStockScaled + input.quantityScaled,

        now,

        transaction,
      );

      createdMovement = movement;
    });

    if (!createdMovement) {
      throw new Error('Não foi possível registrar a entrada.');
    }

    return createdMovement;
  }

  async createExitLocal(input: CreateExitInput): Promise<FeedExit> {
    const db = await getDatabase();

    let createdMovement: FeedExit | null = null;

    await db.withExclusiveTransactionAsync(async (transaction) => {
      const feed = await feedLocalDataSource.findByLocalId(
        input.accountId,
        input.feedLocalId,
        transaction,
      );

      if (!feed) {
        throw new Error('Alimento não encontrado.');
      }

      if (feed.syncStatus === 'pending_delete') {
        throw new Error(
          'Não é possível movimentar um alimento pendente de exclusão.',
        );
      }

      if (input.quantityScaled <= 0) {
        throw new Error('A quantidade deve ser maior que zero.');
      }

      if (input.quantityScaled > feed.projectedStockScaled) {
        throw new Error('Quantidade maior que o estoque disponível.');
      }

      const reason = input.reason.trim();

      if (!reason) {
        throw new Error('Informe o motivo da saída.');
      }

      const sequenceNumber =
        await feedMovementLocalDataSource.getNextSequenceNumber(
          input.accountId,
          input.feedLocalId,
          transaction,
        );

      const now = new Date().toISOString();

      const movement: FeedExit = {
        localId: Crypto.randomUUID(),

        accountId: input.accountId,

        remoteId: null,

        feedLocalId: input.feedLocalId,

        movementType: 'exit',

        quantityScaled: input.quantityScaled,

        valueScaled: null,

        reason,

        occurredOn: input.occurredOn,

        sequenceNumber,

        syncStatus: 'pending_create',

        dispatchState: 'queued',

        balanceState: 'pending',

        localCreatedAt: now,
        localUpdatedAt: now,

        remoteCreatedAt: null,
        remoteUpdatedAt: null,

        lastSyncedAt: null,
        lastSyncError: null,
      };

      await feedMovementLocalDataSource.insert(movement, transaction);

      await feedLocalDataSource.updateProjectedStock(
        input.accountId,
        input.feedLocalId,

        feed.projectedStockScaled - input.quantityScaled,

        now,

        transaction,
      );

      createdMovement = movement;
    });

    if (!createdMovement) {
      throw new Error('Não foi possível registrar a saída.');
    }

    return createdMovement;
  }
}

export const feedMovementRepository = new FeedMovementRepository();
