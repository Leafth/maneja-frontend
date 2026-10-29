import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useCreateFeed, useFeedingAccount } from '../hooks';
import {
  feedTypeSchema,
  type FeedTypeFormData,
} from '../schemas/feed-stock.schema';
import { decimalStringToScaled } from '../utils/feed-decimal';

export function useFeedTypeFormViewModel() {
  const router = useRouter();

  const { accountId } = useFeedingAccount();

  const createFeed = useCreateFeed(accountId);

  const { control, handleSubmit } = useForm<FeedTypeFormData>({
    resolver: zodResolver(feedTypeSchema),
    defaultValues: {
      name: '',
      initialKg: '',
    },
  });

  const onSubmit = handleSubmit(async ({ name, initialKg }) => {
    await createFeed.mutateAsync({
      name: name.trim(),
      initialStockScaled: decimalStringToScaled(initialKg),
    });

    router.back();
  });

  return {
    control,
    onSubmit,

    isSubmitting: createFeed.isPending,

    error: createFeed.error,

    goBack: () => router.back(),
  };
}
