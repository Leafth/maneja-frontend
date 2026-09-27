import '../styles/global.css';
import '@/infrastructure/api/api-interceptors';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style='dark' />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style='dark' />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='(app)' />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
