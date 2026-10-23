import { SyncProvider } from '@/shared/provider/sync-provider';
import { Stack } from 'expo-router';

export const unstable_settings = { anchor: '(tabs)' };

export default function AppLayout() {
  return (
    <SyncProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SyncProvider>
  );
}
