import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useFeedStock } from '../hooks/use-feed-stock';

export function useFeedStockViewModel() {
  const router = useRouter();
  const network = useNetInfo();
  const [section, setSection] = useState<'stock' | 'planning'>('stock');
  const types = useFeedStock((state) => state.types);

  return {
    types,
    section,
    setSection,
    isOnline: network.isConnected === true && network.isInternetReachable !== false,
    openType: (typeId: string) => router.push({ pathname: '/feeding/[typeId]' as never, params: { typeId } }),
    createType: () => router.push('/feeding/types/create'),
    addEntry: (typeId: string) => router.push({ pathname: '/feeding/entry', params: { typeId } }),
    addExit: (typeId: string) => router.push({ pathname: '/feeding/exit', params: { typeId } }),
  };
}
