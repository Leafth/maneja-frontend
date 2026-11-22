import { Tabs } from 'expo-router/js-tabs';

import { BottomNavigation } from '@/shared/components/BottomNavigation';

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name='home' />
      <Tabs.Screen name='herd' />
      <Tabs.Screen name='terrains' />
      <Tabs.Screen name='feeding' />
    </Tabs>
  );
}
