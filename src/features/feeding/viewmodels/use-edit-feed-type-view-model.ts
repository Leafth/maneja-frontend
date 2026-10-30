import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { useFeed, useFeedingAccount, useUpdateFeed } from '../hooks';
import {
  editFeedTypeSchema,
  type EditFeedTypeFormData,
} from '../schemas/feed-stock.schema';

export function useEditFeedTypeViewModel() {
  const router = useRouter();
  const { typeId: routeTypeId } = useLocalSearchParams<{
    typeId?: string | string[];
  }>();
  const localId = typeof routeTypeId === 'string' ? routeTypeId : '';
  const { accountId, isLoading: isAccountLoading } = useFeedingAccount();
  const feedQuery = useFeed(accountId, localId);
  const updateMutation = useUpdateFeed(accountId);
  const initializedLocalId = useRef<string | null>(null);
  const feed = feedQuery.data?.syncStatus === 'pending_delete'
    ? null
    : feedQuery.data;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<EditFeedTypeFormData>({
    resolver: zodResolver(editFeedTypeSchema),
    mode: 'onTouched',
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (feed && initializedLocalId.current !== feed.localId) {
      reset({ name: feed.name });
      initializedLocalId.current = feed.localId;
    }
  }, [feed, reset]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/feeding');
    }
  };

  const onSubmit = handleSubmit(({ name }) => {
    if (!feed || updateMutation.isPending) {
      return;
    }

    updateMutation.mutate(
      { localId: feed.localId, name: name.trim() },
      { onSuccess: goBack },
    );
  });

  return {
    control,
    feed,
    onSubmit,
    goBack,
    isLoading: isAccountLoading || feedQuery.isLoading,
    isUnavailable: !localId || (!feedQuery.isLoading && !feedQuery.isError && !feed),
    loadError: feedQuery.error,
    retry: () => {
      void feedQuery.refetch();
    },
    error: updateMutation.error,
    isValid: isValid && Boolean(feed),
    isSubmitting: isSubmitting || updateMutation.isPending,
  };
}
