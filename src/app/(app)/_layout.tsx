import { Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth/stores';
import { SyncProvider } from '@/shared/provider/sync-provider';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated');
  const stack = <Stack screenOptions={{ headerShown: false }} />;

  return isAuthenticated ? <SyncProvider>{stack}</SyncProvider> : stack;
}
