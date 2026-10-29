import axios from 'axios';

import { animalGroupRepository } from '@/features/animal-groups/repositories/animal-group.repository';
import { terrainRepository } from '@/features/terrains/repositories/terrain.repository';

import { movementCommandRepository } from '../repositories/movement-command.repository';
import { occupationService } from './occupation.service';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data === 'object' && 'errors' in data) {
      return JSON.stringify(data.errors);
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro desconhecido ao sincronizar movimentação.';
}

async function sync(accountId: string): Promise<void> {
  const queued = await movementCommandRepository.findQueued(accountId);

  for (const command of queued) {
    const group = await animalGroupRepository.findById(command.groupLocalId);

    const destination = await terrainRepository.findByLocalId(
      command.destinationTerrainLocalId,
    );

    /*
     * O comando continua queued enquanto suas dependências
     * ainda não tiverem sido sincronizadas.
     */
    if (!group?.remoteId) {
      await movementCommandRepository.markQueued(
        command.localId,
        'Grupo ainda não sincronizado.',
      );

      break;
    }

    if (!destination?.remoteId) {
      await movementCommandRepository.markQueued(
        command.localId,
        'Terreno ainda não sincronizado.',
      );

      break;
    }

    await movementCommandRepository.markSending(command.localId);

    try {
      const occupation = await occupationService.move(
        group.remoteId,
        destination.remoteId,
      );

      await movementCommandRepository.markConfirmed(command.localId, {
        remoteId: occupation.id,
        remoteStartedAt: occupation.started_at,
      });
    } catch (error) {
      const message = getErrorMessage(error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        /*
         * Erros de regra/recurso são definitivos para esse
         * comando. Repetir automaticamente não resolveria.
         */
        if (status === 400 || status === 404 || status === 422) {
          await movementCommandRepository.markRejected(
            command.localId,
            message,
          );

          break;
        }

        /*
         * 401 pode ser uma sessão que ainda será renovada.
         * Deixamos na fila.
         */
        if (status === 401) {
          await movementCommandRepository.markQueued(command.localId, message);

          break;
        }
      }

      /*
       * Timeout, ausência de resposta ou erro inesperado:
       *
       * não sabemos se o servidor chegou a executar o POST.
       * Como /occupations não possui idempotency key,
       * não devemos reenviar automaticamente.
       */
      await movementCommandRepository.markUncertain(command.localId, message);

      /*
       * Não continuamos enviando comandos posteriores.
       * Principalmente se forem do mesmo grupo, pois eles
       * dependem da ordem dos movimentos anteriores.
       */
      break;
    }
  }
}

export const movementSyncService = {
  sync,
};
