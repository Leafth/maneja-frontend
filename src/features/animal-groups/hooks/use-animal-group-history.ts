import { useQuery } from '@tanstack/react-query';

import type { HistoryItem } from '@/shared/models';
import { integrationPending } from '@/shared/utils/integration-pending';

import type { AnimalGroupHistoryKind } from '../models';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroupHistory(
  localId: string,
  kind: AnimalGroupHistoryKind,
) {
  return useQuery({
    networkMode: 'always',
    queryKey: animalGroupQueryKeys.history(localId, kind),

    // TODO(integração): endpoint(s) de histórico de movimentações e
    // alimentação ainda indefinidos. Quando o contrato existir, criar
    // DTO/model e converter para HistoryItem (ver buildTerrainHistory).
    queryFn: async (): Promise<HistoryItem[]> =>
      integrationPending(`histórico (${kind}) do grupo ${localId}`),

    enabled: Boolean(localId),
  });
}
