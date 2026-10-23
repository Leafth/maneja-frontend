import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';

import { useLogoutViewModel } from '../../features/auth/viewmodels/use-logout.view-model';
import { useMeViewModel } from '../../features/auth/viewmodels/use-me.view-model';

export default function HomeView() {
  const { logout, isLoggingOut } = useLogoutViewModel();
  const { user } = useMeViewModel();

  return (
    <View className='flex-1 bg-white'>
      <View className='flex-1 gap-5 px-6 pt-6'>
        <AppText
          size='3xl'
          weight='semiBold'
        >
          Início
        </AppText>

        <AppText size='xl'>
          Bem-vindo ao Maneja {user?.name}!
        </AppText>

        <View className='mt-4'>
          <Button
            onPress={logout}
            isLoading={isLoggingOut}
            className='bg-support-red'
          >
            Sair
          </Button>
        </View>
      </View>
    </View>
  );
}
