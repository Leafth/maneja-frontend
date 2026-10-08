import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';

import { useTerrains } from '../hooks';

export function useTerrainsViewModel() {
  const router = useRouter();
  const query = useTerrains();
  const network = useNetInfo();

  return {
    terrains: query.data ?? [],

    isLoading: query.isPending,
    error: query.error,

    retry: () => {
      void query.refetch();
    },

    isOnline:
      network.isConnected === true &&
      network.isInternetReachable !== false,

    handleAddTerrain: () => {
      router.push('/terrains/create');
    },

    handleOpenTerrain: (terrainId: string) => {
      router.push({
        pathname: '/terrain/[terrainId]',
        params: { terrainId },
      });
    },
  };
}
