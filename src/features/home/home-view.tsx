import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';

import { useHomeViewModel } from './viewmodels/use-home-view-model';

export default function HomeView() {
  const { userName, logout, isLoggingOut } = useHomeViewModel();

  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-white px-6'>
      <View className='flex-1 items-center justify-center gap-3'>
        <AppText size='3xl' weight='semiBold' align='center'>
          Início
        </AppText>

        <AppText size='lg' color='muted' align='center'>
          Bem-vindo ao Maneja{userName ? `, ${userName}` : ''}!
        </AppText>
      </View>

      <View className='pb-6'>
        <Button variant='danger' onPress={logout} isLoading={isLoggingOut}>
          Sair
        </Button>
      </View>
    </SafeAreaView>
  );
}
