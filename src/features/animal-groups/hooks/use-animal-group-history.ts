import { useQuery } from '@tanstack/react-query';

import { feedQueryKeys } from '@/features/feeding/hooks/feed-query-keys';
import { useFeedingAccount } from '@/features/feeding/hooks/use-feeding-account';
import { useFeedingHistory } from '@/features/feeding/hooks/use-feeding-history';

import { feedRepository } from '@/features/feeding/repositories/feed.repository';

import { scaledToDisplay } from '@/features/feeding/utils/feed-decimal';

import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

import type { HistoryItem } from '@/shared/models';

import { formatDate, formatTime } from '@/shared/utils/format-date';

import type { AnimalGroupHistoryKind } from '../models';

import { buildAnimalGroupMovementHistory } from '../utils/build-animal-group-history';

import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroupHistory(
  localId: string,
  kind: AnimalGroupHistoryKind,
) {
  const { accountId } = useFeedingAccount();

  const feedings = useFeedingHistory(accountId, localId, kind === 'feeding');

  const feeds = useQuery({
    queryKey: [...feedQueryKeys.list(accountId ?? ''), 'including-deleted'],

    queryFn: () => feedRepository.findAll(accountId!),

    enabled: kind === 'feeding' && Boolean(accountId),

    networkMode: 'always',
  });

  const movements = useQuery({
    queryKey: animalGroupQueryKeys.history(accountId ?? '', localId, kind),

    queryFn: async (): Promise<HistoryItem[]> => {
      const occupations =
        await occupationRepository.findByGroupLocalId(localId);

      const accountOccupations = occupations.filter(
        (occupation) => occupation.accountId === accountId,
      );

      return buildAnimalGroupMovementHistory(
        accountOccupations.map(occupationRepository.toAnimalGroupOccupation),
      );
    },

    enabled: Boolean(accountId) && Boolean(localId) && kind === 'movements',
  });

  if (kind === 'movements') {
    return movements;
  }

  const states = {
    queued: 'Pendente',
    sending: 'Enviando',
    uncertain: 'Não confirmado',
    rejected: 'Rejeitado',
    confirmed: '',
    cancelled: 'Cancelado',
  };

  return {
    ...feedings,

    isPending: feedings.isPending || feeds.isPending,

    isError: feedings.isError || feeds.isError,

    refetch: async () => {
      await feeds.refetch();

      return feedings.refetch();
    },

    data: feedings.data?.map((record) => ({
      id: record.localId,

      title: `${
        feeds.data?.find((feed) => feed.localId === record.feedLocalId)?.name ??
        'Ração indisponível'
      } · ${scaledToDisplay(record.quantityScaled)} kg`,

      period: `${formatDate(record.occurredAt)} · ${formatTime(
        record.occurredAt,
      )}${
        states[record.dispatchState] ? ` · ${states[record.dispatchState]}` : ''
      }`,
    })),
  };
}
