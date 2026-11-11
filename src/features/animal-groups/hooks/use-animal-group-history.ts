import { useQuery } from '@tanstack/react-query';

import { occupationRepository } from '@/features/movements/repositories/occupation.repository';
import type { HistoryItem } from '@/shared/models';

import type { AnimalGroupHistoryKind } from '../models';
import { buildAnimalGroupMovementHistory } from '../utils/build-animal-group-history';
import { animalGroupQueryKeys } from './animal-group.query-keys';
import { useFeedingAccount } from '@/features/feeding/hooks/use-feeding-account';
import { useFeedingHistory } from '@/features/feeding/hooks/use-feeding-history';
import { feedRepository } from '@/features/feeding/repositories/feed.repository';
import { feedQueryKeys } from '@/features/feeding/hooks/feed-query-keys';
import { scaledToDisplay } from '@/features/feeding/utils/feed-decimal';

export function useAnimalGroupHistory(
  localId: string,
  kind: AnimalGroupHistoryKind,
) {
  const { accountId } = useFeedingAccount();
  const feedings = useFeedingHistory(accountId, localId, kind === 'feeding');
  const feeds = useQuery({
    queryKey: [...feedQueryKeys.list(accountId ?? ''), 'including-deleted'],
    queryFn: () => feedRepository.findAll(accountId!),
    enabled: kind === 'feeding' && !!accountId, networkMode: 'always',
  });
  const movements = useQuery({
    queryKey: animalGroupQueryKeys.history(localId, kind),

    queryFn: async (): Promise<HistoryItem[]> => {
      const occupations =
        await occupationRepository.findByGroupLocalId(localId);

      return buildAnimalGroupMovementHistory(
        occupations.map(occupationRepository.toAnimalGroupOccupation),
      );
    },

    enabled: Boolean(localId) && kind === 'movements',
  });
  if (kind === 'movements') {return movements;}
  const states = { queued: 'Pendente', sending: 'Enviando', uncertain: 'Não confirmado', rejected: 'Rejeitado', confirmed: '', cancelled: 'Cancelado' };
  return { ...feedings, data: feedings.data?.map(record => ({
    id: record.localId,
    title: `${feeds.data?.find(feed => feed.localId === record.feedLocalId)?.name ?? 'Ração indisponível'} · ${scaledToDisplay(record.quantityScaled)} kg`,
    period: `${new Date(record.occurredAt).toLocaleString('pt-BR')}${states[record.dispatchState] ? ` · ${states[record.dispatchState]}` : ''}`,
  })) };
}
