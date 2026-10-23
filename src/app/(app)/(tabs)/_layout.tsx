import { Tabs } from 'expo-router';

import { BottomNavigation } from '@/shared/components/BottomNavigation';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName='home'
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
