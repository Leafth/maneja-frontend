import GroupView from '@/features/animal-groups/view/GroupView';
import { Stack } from 'expo-router';

export default function GroupRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GroupView />
    </>
  );
}
