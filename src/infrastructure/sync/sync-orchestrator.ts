import { animalGroupSyncService } from '@/features/animal-groups/services/animal-group-sync.service';

import { feedRequirementSyncService } from '@/features/feeding/services/feed-requirement-sync.service';
import { feedStockSyncService } from '@/features/feeding/services/feed-stock-sync.service';
import { feedSyncService } from '@/features/feeding/services/feed-sync.service';
import { feedingStockHistoryService } from '@/features/feeding/services/feeding-stock-history.service';
import { verifyFeedingGroups } from '@/features/feeding/services/feeding-sync-context';
import { feedingSyncService } from '@/features/feeding/services/feeding-sync.service';

import { movementCommandRepository } from '@/features/movements/repositories/movement-command.repository';
import { occupationSyncService } from '@/features/movements/services';
import { movementSyncService } from '@/features/movements/services/movement-sync.service';

import { terrainSyncService } from '@/features/terrains/services/terrain-sync.service';

import { sessionLifecycle } from '../auth/session-lifecycle';
import { networkService } from '../network/network.service';
import { syncEvents } from './sync-events';

interface SyncState {
  inFlight: Promise<void> | null;
  rerunRequested: boolean;
  accountId: string | null;
  suspended: boolean;
}

const runtime = globalThis as typeof globalThis & {
  __manejaSyncState?: SyncState;
};

const state = (runtime.__manejaSyncState ??= {
  inFlight: null,
  rerunRequested: false,
  accountId: null,
  suspended: false,
});

// Compatibilidade com estado mantido durante Fast Refresh.
state.suspended ??= false;

class SyncOrchestrator {
  resume(): void {
    if (sessionLifecycle.isLoggingOut()) {
      return;
    }

    state.suspended = false;
  }

  async suspendAndWait(): Promise<void> {
    state.suspended = true;
    state.rerunRequested = false;

    try {
      await state.inFlight;
    } finally {
      state.accountId = null;
      state.rerunRequested = false;
    }
  }

  sync(accountId?: string): Promise<void> {
    if (state.suspended || sessionLifecycle.isLoggingOut()) {
      return Promise.resolve();
    }

    if (accountId) {
      state.accountId = accountId;
    }

    state.rerunRequested = true;

    if (!state.inFlight) {
      state.inFlight = Promise.resolve().then(() => this.drain());
    }

    return state.inFlight;
  }

  private async drain(): Promise<void> {
    try {
      do {
        if (state.suspended || sessionLifecycle.isLoggingOut()) {
          return;
        }

        state.rerunRequested = false;

        const accountId = state.accountId;
        const sessionGeneration = sessionLifecycle.getGeneration();

        const isSessionValid = () =>
          !state.suspended &&
          sessionLifecycle.isCurrent(sessionGeneration) &&
          state.accountId === accountId;

        if (!accountId || !isSessionValid()) {
          return;
        }

        try {
          const connected = await networkService.isConnected();

          if (!isSessionValid()) {
            return;
          }

          if (!connected) {
            continue;
          }

          /*
           * 1. Sincroniza grupos primeiro.
           *
           * Movimentações dependem do remoteId
           * dos grupos.
           */
          await animalGroupSyncService.sync(accountId);

          if (!isSessionValid()) {
            return;
          }

          await verifyFeedingGroups(accountId);

          if (!isSessionValid()) {
            return;
          }

          syncEvents.emit('animal-groups');

          /*
           * 2. Sincroniza terrenos.
           *
           * Movimentações também dependem do
           * remoteId do terreno de destino.
           */
          await terrainSyncService.sync(accountId);

          if (!isSessionValid()) {
            return;
          }

          syncEvents.emit('terrains');

          /*
           * 3. Recupera movimentações que ficaram
           * presas em "sending".
           *
           * Como o POST /occupations não é
           * idempotente, essas movimentações viram
           * "uncertain" em vez de serem reenviadas.
           */
          await movementCommandRepository.recoverInterrupted(accountId);

          if (!isSessionValid()) {
            return;
          }

          /*
           * 4. Envia movimentações pendentes.
           */
          await movementSyncService.sync(accountId);

          if (!isSessionValid()) {
            return;
          }

          /*
           * 5. Reconciliamos terrenos e grupos
           * com o estado confirmado pelo servidor.
           *
           * Uma movimentação pode alterar:
           *
           * origem:
           * occupied -> resting / available
           *
           * destino:
           * available / resting -> occupied
           *
           * grupo:
           * current_terrain
           */
          await terrainSyncService.pull(accountId);

          if (!isSessionValid()) {
            return;
          }

          await animalGroupSyncService.pullRemote(accountId);

          if (!isSessionValid()) {
            return;
          }

          /*
           * 6. Atualiza o cache local das ocupações.
           * Histórico e detalhes passam a funcionar offline.
           */
          await occupationSyncService.pull(accountId);

          if (!isSessionValid()) {
            return;
          }

          syncEvents.emit('terrains');
          syncEvents.emit('animal-groups');

          /*
           * 7. Sincroniza criações e edições
           * pendentes de rações.
           */
          await feedSyncService.syncUpserts(accountId);

          if (!isSessionValid()) {
            return;
          }

          await feedRequirementSyncService.sync(accountId);

          if (!isSessionValid()) {
            return;
          }

          syncEvents.emit('feed-requirements');

          /*
           * 8. Envia entradas e saídas de estoque.
           *
           * O finally original é mantido para
           * notificar alterações mesmo em caso
           * de falha na operação.
           */
          try {
            await feedStockSyncService.sync(accountId);
          } finally {
            if (isSessionValid()) {
              syncEvents.emit('feedings');
            }
          }

          if (!isSessionValid()) {
            return;
          }

          /*
           * 9. Processa exclusões de rações.
           */
          await feedSyncService.syncDeletes(accountId);

          if (!isSessionValid()) {
            return;
          }

          /*
           * 10. Atualiza o snapshot remoto das
           * rações no SQLite.
           */
          await feedSyncService.pull(accountId);

          if (!isSessionValid()) {
            return;
          }

          await feedRequirementSyncService.pull(accountId);

          if (!isSessionValid()) {
            return;
          }

          await feedingSyncService.pull(accountId);

          if (!isSessionValid()) {
            return;
          }

          await feedingStockHistoryService.pull(accountId);

          if (!isSessionValid()) {
            return;
          }

          syncEvents.emit('feed-requirements');
          syncEvents.emit('feedings');
          syncEvents.emit('feeds');
        } catch (error) {
          if (!isSessionValid()) {
            return;
          }

          console.error('Erro durante a sincronização:', error);
        }
      } while (
        state.rerunRequested &&
        !state.suspended &&
        !sessionLifecycle.isLoggingOut()
      );
    } finally {
      state.inFlight = null;
    }
  }
}

export const syncOrchestrator = new SyncOrchestrator();
