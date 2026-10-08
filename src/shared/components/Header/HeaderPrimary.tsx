// HeaderPrimary.tsx
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { OnlineStatus } from '@/shared/components/OnlineStatus';

interface IHeaderPrimaryProps {
  isOnline: boolean;
  initials?: string;
  left?: ReactNode;
  center?: ReactNode;
}

export function HeaderPrimary({
  isOnline,
  initials = 'TA',
  left,
  center,
}: IHeaderPrimaryProps) {
  return (
    <SafeAreaView edges={['top']} className='bg-lime-500'>
      <StatusBar style='light' />
      <View className='h-[80px] flex-row items-center justify-between px-4'>
        {left ?? (
          <View className='h-10 w-10 items-center justify-center rounded-full bg-lime-700'>
            <AppText size='sm' weight='medium' color='white'>
              {initials}
            </AppText>
          </View>
        )}

        <View className='flex-1 items-center'>{center}</View>

        <OnlineStatus isOnline={isOnline} />
      </View>
    </SafeAreaView>
  );
}
