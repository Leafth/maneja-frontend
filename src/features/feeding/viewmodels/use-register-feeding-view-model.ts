import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { formatDate, formatTime } from '@/shared/utils/format-date';

import { useFeedingAccount, useFeeds } from '../hooks';
import { useFeedingGroups } from '../hooks/use-feeding-groups';
import { useRegisterFeeding } from '../hooks/use-register-feeding';
import { registerFeedingSchema, type RegisterFeedingFormData } from '../schemas/feeding.schema';
import { brDateTimeToIso } from '../utils/feed-date';
import { decimalStringToScaled, scaledToNumber } from '../utils/feed-decimal';

export function useRegisterFeedingViewModel() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string | string[] }>();
  const groupLocalId = typeof groupId === 'string' ? groupId : '';
  const account = useFeedingAccount();
  const groupsQuery = useFeedingGroups(account.accountId);
  const feedsQuery = useFeeds(account.accountId);
  const now = new Date().toISOString();
  const { control, handleSubmit, setError } = useForm<RegisterFeedingFormData>({
    resolver: zodResolver(registerFeedingSchema),
    defaultValues: {
      groupLocalId,
      feedLocalId: '', quantityKg: '', date: formatDate(now), time: formatTime(now),
    },
  });
  const register = useRegisterFeeding(account.accountId, groupLocalId);
  const groups = groupsQuery.data ?? [];
  const group = groups.find((item) => item.localId === groupLocalId);
  const feeds = feedsQuery.data ?? [];
  const hasError = account.isError || groupsQuery.isError || feedsQuery.isError;
  const isLoading = account.isLoading || groupsQuery.isLoading || feedsQuery.isLoading;

  const onSubmit = handleSubmit((values) => {
    if (register.isPending || !account.accountId || !group) { return; }
    const feed = feeds.find((item) => item.localId === values.feedLocalId);
    if (!feed) {
      setError('feedLocalId', { message: 'Selecione uma ração disponível' });
      return;
    }
    const quantityScaled = decimalStringToScaled(values.quantityKg);
    if (quantityScaled > feed.projectedStockScaled) {
      setError('quantityKg', { message: 'Estoque insuficiente para esta alimentação' });
      return;
    }
    register.mutate({
      feedLocalId: values.feedLocalId,
      quantityScaled,
      occurredAt: brDateTimeToIso(values.date, values.time),
    }, { onSuccess: () => router.dismissTo({
      pathname: '/group/[localId]',
      params: { localId: groupLocalId, history: 'feeding' },
    }) });
  });

  return {
    control,
    group,
    feedOptions: feeds.map((feed) => ({ value: feed.localId, label: `${feed.name} – ${scaledToNumber(feed.projectedStockScaled).toLocaleString('pt-BR')} kg em estoque` })),
    isLoading,
    hasError,
    isSubmitting: register.isPending,
    error: register.error?.message,
    canSubmit: !isLoading && !hasError && Boolean(account.accountId) && Boolean(group) && feeds.length > 0,
    retry: () => { void groupsQuery.refetch(); void feedsQuery.refetch(); },
    onSubmit,
    goBack: () => { if (router.canGoBack()) { router.back(); } else { router.replace('/herd'); } },
  };
}
