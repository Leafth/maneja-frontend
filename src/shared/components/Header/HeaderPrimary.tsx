import { useNetInfo } from '@react-native-community/netinfo';
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/stores';
import { useLogoutViewModel } from '@/features/auth/viewmodels/use-logout.view-model';
import { AppText } from '@/shared/components/AppText';
import { OnlineStatus } from '@/shared/components/OnlineStatus';
import { getInitials } from '@/shared/utils/git-initials';

import { ProfileMenu } from './ProfileMenu';

interface IHeaderPrimaryProps {
  initials?: string;
  left?: ReactNode;
  center?: ReactNode;
  showGreeting?: boolean;
}

export function HeaderPrimary({
  initials,
  left,
  center,
  showGreeting = true,
}: IHeaderPrimaryProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const userName = useAuthStore((state) => state.user?.name);

  const network = useNetInfo();

  const { logout, isLoggingOut } = useLogoutViewModel();

  const avatarInitials = initials ?? getInitials(userName);

  const isOnline =
    network.isConnected === true && network.isInternetReachable !== false;

  function handleLogout() {
    setIsProfileMenuOpen(false);

    Alert.alert('Sair da conta', 'Deseja realmente encerrar sua sessão?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          void logout().catch(() => {
            Alert.alert('Erro', 'Não foi possível concluir a saída da conta.');
          });
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} className='bg-forestGreen-300'>
      <StatusBar style='light' />

      <View className='h-[100px] flex-row items-center justify-between px-4'>
        {left ?? (
          <Pressable
            onPress={() => setIsProfileMenuOpen(true)}
            disabled={isLoggingOut}
            accessibilityRole='button'
            accessibilityLabel='Abrir menu do perfil'
            className='h-10 w-10 items-center justify-center rounded-full bg-[#013000]'
          >
            <AppText size='sm' weight='medium' color='white'>
              {avatarInitials}
            </AppText>
          </Pressable>
        )}

        <View className='ml-3 flex-1'>
          {center ??
            (showGreeting && (
              <View className='gap-0.5'>
                <AppText size='sm' color='muted'>
                  Olá, 👋
                </AppText>

                <AppText weight='semiBold'>{userName || 'Usuário'}</AppText>
              </View>
            ))}
        </View>

        <OnlineStatus isOnline={isOnline} />
      </View>

      <Modal
        visible={isProfileMenuOpen}
        transparent
        animationType='fade'
        onRequestClose={() => setIsProfileMenuOpen(false)}
      >
        <View className='flex-1'>
          <Pressable
            className='absolute inset-0'
            onPress={() => setIsProfileMenuOpen(false)}
            accessibilityLabel='Fechar menu do perfil'
          />

          <View className='absolute left-4 top-24'>
            <ProfileMenu onLogout={handleLogout} isLoggingOut={isLoggingOut} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
