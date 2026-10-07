import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';

import { useAnimalGroups } from '../hooks';

export function useHerdViewModel() {
  const router = useRouter();
  const query = useAnimalGroups();
  const network = useNetInfo();

  return {
    herds: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    retry: () => {
      void query.refetch();
    },
    isOnline: network.isConnected === true && network.isInternetReachable !== false,
    handleAddHerd: () => router.push('/create-group'),
    handleOpenGroup: (localId: string) =>
      router.push({ pathname: '/group', params: { localId } }),
  };
}
