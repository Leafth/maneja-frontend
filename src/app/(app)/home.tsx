import HomeView from '@/features/home/home-view';
import { Stack } from 'expo-router';

export default function HomeRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HomeView />
    </>
  );
}
