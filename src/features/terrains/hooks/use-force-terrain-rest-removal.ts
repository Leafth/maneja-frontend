import { useMutation, useQueryClient } from '@tanstack/react-query';

import { integrationPending } from '@/shared/utils/integration-pending';

import { terrainQueryKeys } from './terrain.query-keys';

/**
 * Retira o terreno do descanso antes do prazo (status → disponível).
 * O backend não valida o período de descanso; essa regra existe só no frontend.
 */
export function useForceTerrainRestRemoval() {
  const queryClient = useQueryClient();

  return useMutation({
    // TODO(integração): endpoint de retirada de descanso ainda indefinido.
    mutationFn: async (localId: string): Promise<void> =>
      integrationPending(`retirada de descanso do terreno ${localId}`),

    networkMode: 'always',

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: terrainQueryKeys.all });
    },
  });
}
