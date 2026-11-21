import { isAxiosError } from 'axios';

import { feedMapper } from '../mappers/feed.mapper';
import type { Feed } from '../models/feed.model';
import { feedRepository } from '../repositories/feed.repository';
import { scaledToNumber } from '../utils/feed-decimal';

import { feedService } from './feed.service';

const UNCERTAIN_CREATE_PREFIX = '[UNCERTAIN_CREATE]';

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.data) {
      try {
        return JSON.stringify(error.response.data);
      } catch {
        return error.message;
      }
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro desconhecido durante a sincronização.';
}

function hasUncertainCreate(feed: Feed): boolean {
  return (
    feed.syncStatus === 'pending_create' &&
    feed.lastSyncError?.startsWith(UNCERTAIN_CREATE_PREFIX) === true
  );
}

class FeedSyncService {
  async syncUpserts(accountId: string): Promise<void> {
    const pendingFeeds = await feedRepository.findPending(accountId);

    for (const feed of pendingFeeds) {
      if (feed.syncStatus === 'pending_create') {
        if (hasUncertainCreate(feed)) {
          continue;
        }

        await this.pushCreate(feed);
        continue;
      }

      if (feed.syncStatus === 'pending_update') {
        await this.pushUpdate(feed);
      }
    }
  }

  async syncDeletes(accountId: string): Promise<void> {
    const pendingFeeds = await feedRepository.findPending(accountId);

    for (const feed of pendingFeeds) {
      if (feed.syncStatus !== 'pending_delete') {
        continue;
      }

      await this.pushDelete(feed);
    }
  }

  async pull(accountId: string): Promise<void> {
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await feedService.list({
        page,
        per_page: perPage,
      });

      for (const dto of response.data) {
        const snapshot = feedMapper.fromDto(dto);

        await feedRepository.mergeRemoteSnapshot(accountId, snapshot);
      }

      if (page >= response.meta.total_pages) {
        break;
      }

      page += 1;
    }
  }

  private async pushCreate(feed: Feed): Promise<void> {
    if (feed.initialStockScaled === null) {
      await feedRepository.recordSyncError(
        feed.accountId,
        feed.localId,
        'Saldo inicial ausente para criação do alimento.',
      );

      return;
    }

    const expectedLocalUpdatedAt = feed.localUpdatedAt;

    try {
      const response = await feedService.create({
        feed: {
          name: feed.name,
          initial_stock_quantity: scaledToNumber(feed.initialStockScaled),
        },
      });

      const snapshot = feedMapper.fromDto(response);

      await feedRepository.assignRemoteIdentity(
        feed.accountId,
        feed.localId,
        snapshot,
        expectedLocalUpdatedAt,
      );
    } catch (error) {
      if (isAxiosError(error) && !error.response) {
        await feedRepository.recordSyncError(
          feed.accountId,
          feed.localId,
          `${UNCERTAIN_CREATE_PREFIX} ${getErrorMessage(error)}`,
        );

        return;
      }

      await feedRepository.recordSyncError(
        feed.accountId,
        feed.localId,
        getErrorMessage(error),
      );
    }
  }

  private async pushUpdate(feed: Feed): Promise<void> {
    if (!feed.remoteId) {
      await feedRepository.recordSyncError(
        feed.accountId,
        feed.localId,
        'Alimento pendente de atualização sem remoteId.',
      );

      return;
    }

    const expectedLocalUpdatedAt = feed.localUpdatedAt;

    try {
      const response = await feedService.update(feed.remoteId, {
        feed: {
          name: feed.name,
        },
      });

      const snapshot = feedMapper.fromDto(response);

      await feedRepository.confirmRemoteUpdate(
        feed.accountId,
        feed.localId,
        snapshot,
        expectedLocalUpdatedAt,
      );
    } catch (error) {
      await feedRepository.recordSyncError(
        feed.accountId,
        feed.localId,
        getErrorMessage(error),
      );
    }
  }

  private async pushDelete(feed: Feed): Promise<void> {
    if (!feed.remoteId) {
      await feedRepository.confirmRemoteDelete(feed.accountId, feed.localId);

      return;
    }

    try {
      await feedService.remove(feed.remoteId);

      await feedRepository.confirmRemoteDelete(feed.accountId, feed.localId);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        await feedRepository.confirmRemoteDelete(feed.accountId, feed.localId);

        return;
      }

      await feedRepository.recordSyncError(
        feed.accountId,
        feed.localId,
        getErrorMessage(error),
      );
    }
  }
}

export const feedSyncService = new FeedSyncService();
