import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FeedPlanningSection from '@/features/feeding/view/FeedPlanningSection';
import { HeaderSecondary } from '@/shared/components/Header';

export default function Route() {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/herd');
    }
  }

  return (
    <View className='flex-1 bg-white'>
      <HeaderSecondary title='Planejar alimentação' onBackPress={handleBack} />

      <SafeAreaView edges={['bottom']} className='flex-1'>
        <ScrollView
          className='flex-1'
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          <FeedPlanningSection />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
