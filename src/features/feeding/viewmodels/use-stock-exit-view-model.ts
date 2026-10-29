import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { useCreateFeedExit, useFeedingAccount, useFeeds } from '../hooks';
import {
  stockExitSchema,
  type StockExitFormData,
} from '../schemas/feed-stock.schema';
import { brDateToDateOnly } from '../utils/feed-date';
import { decimalStringToScaled } from '../utils/feed-decimal';

export function useStockExitViewModel() {
  const router = useRouter();

  const { typeId } = useLocalSearchParams<{
    typeId?: string;
  }>();

  const { accountId } = useFeedingAccount();

  const feedsQuery = useFeeds(accountId);
  const createExit = useCreateFeedExit(accountId);

  const feeds = feedsQuery.data ?? [];

  const types = feeds.map((feed) => ({
    id: feed.localId,
    name: feed.name,
  }));

  const { control, handleSubmit, setError, setValue } =
    useForm<StockExitFormData>({
      resolver: zodResolver(stockExitSchema),
      defaultValues: {
        typeId: typeof typeId === 'string' ? typeId : '',
        quantity: '',
        reason: '',
        date: new Date().toLocaleDateString('pt-BR'),
      },
    });

  const selectedTypeId = useWatch({
    control,
    name: 'typeId',
  });

  const onSubmit = handleSubmit(
    async ({ typeId: feedLocalId, quantity, reason, date }) => {
      const quantityScaled = decimalStringToScaled(quantity);

      const feed = feeds.find((item) => item.localId === feedLocalId);

      if (!feed || quantityScaled > feed.projectedStockScaled) {
        setError('quantity', {
          message: 'Quantidade maior que o estoque disponível',
        });

        return;
      }

      await createExit.mutateAsync({
        feedLocalId,
        quantityScaled,
        reason: reason.trim(),
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
    isSubmitting: createExit.isPending,
    error: createExit.error,

    selectType: (id: string) =>
      setValue('typeId', id, {
        shouldValidate: true,
      }),

    goBack: () => router.back(),
  };
}
