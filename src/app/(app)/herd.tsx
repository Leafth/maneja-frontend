import HerdView from '@/features/animal-groups/view/HerdView';
import { Stack } from 'expo-router';

export default function HerdRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HerdView />
    </>
  );
}
