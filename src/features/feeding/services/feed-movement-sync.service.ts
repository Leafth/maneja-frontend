import { isAxiosError } from 'axios';

import { feedMapper } from '../mappers/feed.mapper';
import type { FeedMovement } from '../models/feed-movement.model';
import { feedMovementRepository } from '../repositories/feed-movement.repository';
import { feedRepository } from '../repositories/feed.repository';
import { scaledToNumber } from '../utils/feed-decimal';

import { feedMovementService } from './feed-movement.service';
import { feedService } from './feed.service';

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

class FeedMovementSyncService {
  async sync(accountId: string): Promise<void> {
    const feeds = await feedRepository.findAll(accountId);

    for (const feed of feeds) {
      if (!feed.remoteId) {
        continue;
      }

      /*
       * Primeiro verificamos se existe algum movimento
       * confirmado pelo servidor cujo efeito ainda não
       * foi incorporado ao snapshot local de saldo.
       *
       * Isso pode acontecer, por exemplo, se:
       *
       * POST movimento -> 201
       * GET Feed -> falha de rede
       */
      const existingMovements = await feedMovementRepository.findByFeedLocalId(
        accountId,
        feed.localId,
      );

      const hasPendingReconciliation = existingMovements.some(
        (movement) =>
          movement.syncStatus === 'synced' &&
          movement.dispatchState === 'confirmed' &&
          movement.balanceState === 'pending',
      );

      if (hasPendingReconciliation) {
        const reconciled = await this.reconcileFeed(
          accountId,
          feed.localId,
          feed.remoteId,
        );

        if (!reconciled) {
          continue;
        }
      }

      /*
       * Aqui buscamos TODOS os movimentos ainda
       * pending_create em ordem de sequenceNumber.
       *
       * Não buscamos somente queued porque um
       * rejected/uncertain anterior deve bloquear
       * os movimentos seguintes.
       */
      const pendingMovements =
        await feedMovementRepository.findPendingByFeedLocalId(
          accountId,
          feed.localId,
        );

      for (const movement of pendingMovements) {
        /*
         * Rejeição precisa ser resolvida antes de
         * continuar a cadeia desse Feed.
         */
        if (movement.dispatchState === 'rejected') {
          break;
        }

        /*
         * Resultado incerto não pode ser reenviado
         * automaticamente porque o POST não é
         * idempotente.
         */
        if (movement.dispatchState === 'uncertain') {
          break;
        }

        /*
         * Se encontramos "sending" depois de outro
         * ciclo/app restart, não sabemos se o POST
         * chegou a ser confirmado pelo servidor.
         *
         * Portanto convertemos para uncertain em vez
         * de reenviar automaticamente.
         */
        if (movement.dispatchState === 'sending') {
          await feedMovementRepository.markUncertain(
            movement.accountId,
            movement.localId,
            'A sincronização anterior foi interrompida durante o envio.',
          );

          break;
        }

        if (movement.dispatchState !== 'queued') {
          break;
        }

        const shouldContinue = await this.pushMovement(feed.remoteId, movement);

        if (!shouldContinue) {
          break;
        }
      }
    }
  }

  private async pushMovement(
    feedRemoteId: string,
    movement: FeedMovement,
  ): Promise<boolean> {
    await feedMovementRepository.markSending(
      movement.accountId,
      movement.localId,
    );

    /*
     * IMPORTANTE:
     *
     * O try/catch abaixo cobre somente o POST.
     *
     * Depois que recebemos 201 e chamamos
     * markConfirmed(), não podemos transformar o
     * movimento em uncertain só porque o GET usado
     * para reconciliar o saldo falhou.
     */
    try {
      if (movement.movementType === 'entry') {
        const response = await feedMovementService.createEntry(feedRemoteId, {
          entry: {
            quantity: scaledToNumber(movement.quantityScaled),

            value: scaledToNumber(movement.valueScaled),

            occurred_on: movement.occurredOn,
          },
        });

        await feedMovementRepository.markConfirmed({
          accountId: movement.accountId,
          localId: movement.localId,

          remoteId: response.id,

          remoteCreatedAt: response.created_at,

          remoteUpdatedAt: response.updated_at,
        });
      } else {
        const response = await feedMovementService.createExit(feedRemoteId, {
          exit: {
            quantity: scaledToNumber(movement.quantityScaled),

            reason: movement.reason,

            occurred_on: movement.occurredOn,
          },
        });

        await feedMovementRepository.markConfirmed({
          accountId: movement.accountId,
          localId: movement.localId,

          remoteId: response.id,

          remoteCreatedAt: response.created_at,

          remoteUpdatedAt: response.updated_at,
        });
      }
    } catch (error) {
      return this.handlePushError(movement, error);
    }

    /*
     * Chegando aqui, o POST retornou 201.
     *
     * Agora precisamos buscar o Feed atualizado
     * porque a resposta do movimento não contém
     * stock_quantity.
     */
    return this.reconcileFeed(
      movement.accountId,
      movement.feedLocalId,
      feedRemoteId,
    );
  }

  private async reconcileFeed(
    accountId: string,
    feedLocalId: string,
    feedRemoteId: string,
  ): Promise<boolean> {
    try {
      const response = await feedService.find(feedRemoteId);

      const snapshot = feedMapper.fromDto(response);

      await feedMovementRepository.reconcileBalance({
        accountId,
        feedLocalId,

        remoteStockScaled: snapshot.remoteStockScaled,

        remoteUpdatedAt: snapshot.remoteUpdatedAt,
      });

      return true;
    } catch (error) {
      /*
       * O movimento pode já estar confirmado.
       *
       * Portanto NÃO voltamos o movimento para
       * queued e NÃO o marcamos uncertain.
       *
       * Apenas registramos que a reconciliação
       * do Feed ainda precisa ser repetida.
       */
      await feedRepository.recordSyncError(
        accountId,
        feedLocalId,
        `Falha ao reconciliar saldo: ${getErrorMessage(error)}`,
      );

      return false;
    }
  }

  private async handlePushError(
    movement: FeedMovement,
    error: unknown,
  ): Promise<boolean> {
    const message = getErrorMessage(error);

    if (isAxiosError(error)) {
      const status = error.response?.status;

      /*
       * O interceptor de autenticação já pode ter
       * tentado refresh.
       *
       * Se ainda recebemos 401, preservamos o comando
       * para uma sincronização futura.
       */
      if (status === 401) {
        await feedMovementRepository.markQueued(
          movement.accountId,
          movement.localId,
          message,
        );

        throw error;
      }

      /*
       * Rejeições conhecidas.
       *
       * 400 -> payload inválido
       * 404 -> Feed remoto indisponível
       * 422 -> validação / saldo insuficiente
       */
      if (status === 400 || status === 404 || status === 422) {
        await feedMovementRepository.markRejected(
          movement.accountId,
          movement.localId,
          message,
        );

        return false;
      }

      /*
       * Sem response:
       *
       * não sabemos se o servidor recebeu/aplicou
       * o movimento.
       */
      if (!error.response) {
        await feedMovementRepository.markUncertain(
          movement.accountId,
          movement.localId,
          message,
        );

        return false;
      }
    }

    /*
     * Outros casos, inclusive respostas inesperadas
     * 5xx, permanecem conservadoramente uncertain.
     */
    await feedMovementRepository.markUncertain(
      movement.accountId,
      movement.localId,
      message,
    );

    return false;
  }
}

export const feedMovementSyncService = new FeedMovementSyncService();
