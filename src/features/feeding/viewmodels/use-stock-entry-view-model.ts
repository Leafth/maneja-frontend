import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { useCreateFeedEntry, useFeedingAccount, useFeeds } from '../hooks';
import {
  stockEntrySchema,
  type StockEntryFormData,
} from '../schemas/feed-stock.schema';
import { brDateToDateOnly } from '../utils/feed-date';
import { decimalStringToScaled } from '../utils/feed-decimal';

export function useStockEntryViewModel() {
  const router = useRouter();

  const { typeId } = useLocalSearchParams<{
    typeId?: string;
  }>();

  const { accountId } = useFeedingAccount();

  const feedsQuery = useFeeds(accountId);

  const createEntry = useCreateFeedEntry(accountId);

  // Aberto a partir do detalhe: o tipo de ração vem da rota e não muda.
  const lockedTypeId = typeof typeId === 'string' && typeId ? typeId : null;

  const types = (feedsQuery.data ?? []).map((feed) => ({
    id: feed.localId,
    name: feed.name,
  }));

  const { control, handleSubmit, setValue } = useForm<StockEntryFormData>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      typeId: lockedTypeId ?? '',
      quantityKg: '',
      value: '',
      date: new Date().toLocaleDateString('pt-BR'),
    },
  });

  const selectedTypeId = useWatch({
    control,
    name: 'typeId',
  });

  const onSubmit = handleSubmit(
    async ({ typeId: feedLocalId, quantityKg, value, date }) => {
      await createEntry.mutateAsync({
        feedLocalId,

        quantityScaled: decimalStringToScaled(quantityKg),

        valueScaled: decimalStringToScaled(value),

        occurredOn: brDateToDateOnly(date),
      });

      router.back();
    },
  );

  return {
    control,
    types,
    isTypeLocked: lockedTypeId !== null,
    lockedTypeName:
      types.find((type) => type.id === lockedTypeId)?.name ?? null,
    selectedTypeId,
    onSubmit,

    isSubmitting: createEntry.isPending,

    error: createEntry.error,

    selectType: (id: string) =>
      setValue('typeId', id, {
        shouldValidate: true,
      }),

    goBack: () => router.back(),
  };
}
