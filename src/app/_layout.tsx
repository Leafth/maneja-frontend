import '@/infrastructure/api/api-interceptors';
import '../styles/global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useRestoreSession } from '@/features/auth/hooks/use-restore-session';
import { useAuthStore } from '@/features/auth/stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'HostGrotesk-Light': require('../../assets/fonts/HostGrotesk-Light.ttf'),
    'HostGrotesk-Regular': require('../../assets/fonts/HostGrotesk-Regular.ttf'),
    'HostGrotesk-Medium': require('../../assets/fonts/HostGrotesk-Medium.ttf'),
    'HostGrotesk-SemiBold': require('../../assets/fonts/HostGrotesk-SemiBold.ttf'),
    'HostGrotesk-Bold': require('../../assets/fonts/HostGrotesk-Bold.ttf'),
  });

  useRestoreSession();

  const authStatus = useAuthStore((s) => s.status);
  const isAuthenticated = authStatus === 'authenticated';
  const isReady = fontsLoaded && authStatus !== 'loading';

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style='dark' />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name='(auth)' />
            </Stack.Protected>
            <Stack.Protected guard={isAuthenticated}>
              <Stack.Screen name='(app)' />
            </Stack.Protected>
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
