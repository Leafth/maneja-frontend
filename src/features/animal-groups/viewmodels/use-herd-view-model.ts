import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';

import { useAnimalGroupCurrentTerrains, useAnimalGroups } from '../hooks';

export function useHerdViewModel() {
  const router = useRouter();
  const query = useAnimalGroups();
  const herds = query.data ?? [];
  const currentTerrainsQuery = useAnimalGroupCurrentTerrains(
    herds.map((herd) => herd.localId),
  );
  const network = useNetInfo();

  return {
    herds,
    /** undefined enquanto carrega; null quando o grupo não está alocado. */
    getCurrentTerrainName: (localId: string) => {
      const terrains = currentTerrainsQuery.data;

      return terrains ? (terrains[localId]?.name ?? null) : undefined;
    },
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
      router.push({ pathname: '/movement/select-terrain', params: { groupId: localId } }),
    handleRegisterFeeding: (localId: string) =>
      router.push({ pathname: '/group/[localId]/feeding-need', params: { localId } }),
  };
}
