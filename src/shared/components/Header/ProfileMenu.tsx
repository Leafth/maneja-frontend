import { LogOut } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

interface IProfileMenuProps {
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function ProfileMenu({
  onLogout,
  isLoggingOut = false,
}: IProfileMenuProps) {
  return (
    <View className='absolute left-4 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-neutral-border bg-white p-2 shadow-lg'>
      <Pressable
        onPress={onLogout}
        disabled={isLoggingOut}
        accessibilityRole='button'
        accessibilityLabel='Sair da conta'
        className='flex-row items-center gap-3 rounded-lg px-3 py-3'
      >
        <LogOut size={20} color='#B91C1C' />

        <AppText weight='medium' className='text-support-danger-solid'>
          {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
        </AppText>
      </Pressable>
    </View>
  );
}
