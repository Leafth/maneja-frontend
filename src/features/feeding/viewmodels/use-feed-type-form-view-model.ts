import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useFeedStock } from '../hooks/use-feed-stock';
import { feedTypeSchema, type FeedTypeFormData } from '../schemas/feed-stock.schema';

export function useFeedTypeFormViewModel() {
  const router = useRouter();
  const addType = useFeedStock((state) => state.addType);
  const { control, handleSubmit } = useForm<FeedTypeFormData>({
    resolver: zodResolver(feedTypeSchema),
    defaultValues: { name: '', initialKg: '' },
  });

  return {
    control,
    goBack: () => router.back(),
    onSubmit: handleSubmit(({ name, initialKg }) => {
      addType(name, Number(initialKg.replace(',', '.')));
      router.back();
    }),
  };
}
