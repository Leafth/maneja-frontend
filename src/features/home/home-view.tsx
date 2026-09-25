import { Button } from '@/shared/components/Button';
import { Text, View } from 'react-native';
import { useLogoutViewModel } from '../auth/viewmodels/use-logout.view-model';
import { useMeViewModel } from '../auth/viewmodels/use-me.view-model';

export default function HomeView() {
  const { logout, isLoggingOut } = useLogoutViewModel();
  const { user } = useMeViewModel();

  return (
    <View className='flex gap-5'>
      <Text className='text-6xl'>Home</Text>
      <Text className='text-xl font-light'>
        Bem vindo ao maneja {user?.name}!!
      </Text>
      <Button
        onPress={logout}
        isLoading={isLoggingOut}
        className='bg-support-red'
      >
        Sair
      </Button>
    </View>
  );
}
