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

  const types = (feedsQuery.data ?? []).map((feed) => ({
    id: feed.localId,
    name: feed.name,
  }));

  const { control, handleSubmit, setValue } = useForm<StockEntryFormData>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      typeId: typeof typeId === 'string' ? typeId : '',
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
