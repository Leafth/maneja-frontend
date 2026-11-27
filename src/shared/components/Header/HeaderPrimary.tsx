import { useNetInfo } from '@react-native-community/netinfo';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/stores';
import { AppText } from '@/shared/components/AppText';
import { OnlineStatus } from '@/shared/components/OnlineStatus';
import { getInitials } from '@/shared/utils/git-initials';

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
  const userName = useAuthStore((state) => state.user?.name);
  const network = useNetInfo();

  const avatarInitials = initials ?? getInitials(userName);

  const isOnline =
    network.isConnected === true && network.isInternetReachable !== false;

  return (
    <SafeAreaView edges={['top']} className='bg-forestGreen-300'>
      <StatusBar style='light' />

      <View className='h-[100px] flex-row items-center justify-between px-4'>
        {left ?? (
          <View className='h-10 w-10 items-center justify-center rounded-full bg-[#013000]'>
            <AppText size='sm' weight='medium' color='white'>
              {avatarInitials}
            </AppText>
          </View>
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
    </SafeAreaView>
  );
}
