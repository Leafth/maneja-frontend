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
    isOnline:
      network.isConnected === true && network.isInternetReachable !== false,

    handleAddHerd: () => router.push('/herd/create'),
    handleOpenGroup: (localId: string) =>
      router.push({ pathname: '/group/[localId]', params: { localId } }),
    handleMove: (localId: string) =>
      router.push({ pathname: '/group/[localId]/move', params: { localId } }),
    handleRegisterFeeding: (localId: string) =>
      router.push({ pathname: '/group/[localId]/feeding-need', params: { localId } }),
  };
}
