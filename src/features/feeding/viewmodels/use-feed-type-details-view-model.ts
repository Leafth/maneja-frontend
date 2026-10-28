import { useLocalSearchParams, useRouter } from 'expo-router';

import { useFeedStock } from '../hooks/use-feed-stock';

export function useFeedTypeDetailsViewModel() {
  const router = useRouter();
  const { typeId } = useLocalSearchParams<{ typeId?: string }>();
  const type = useFeedStock((state) => state.types.find((item) => item.id === typeId));

  return {
    type,
    goBack: () => router.back(),
    addEntry: () => router.push({ pathname: '/feeding/entry', params: { typeId } }),
    addExit: () => router.push({ pathname: '/feeding/exit', params: { typeId } }),
  };
}
