import CreateGroupView from '@/features/animal-groups/view/CreateGroupView';
import { Stack } from 'expo-router';

export default function CreateGroupRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CreateGroupView />
    </>
  );
}
