import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  MoreVertical,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ActionMenu,
  type ActionMenuItem,
} from '@/shared/components/ActionMenu';
import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

const HEADER_HEIGHT = 56;

export type IHeaderMenuItem = ActionMenuItem;

interface IHeaderSecondaryProps {
  title: string;
  /** Padrão: router.back(). */
  onBackPress?: () => void;
  /** Se informado e não vazio, exibe o ⋮ com um menu. */
  menuItems?: IHeaderMenuItem[];
  menuDisabled?: boolean;
}

export function HeaderSecondary({
  title,
  onBackPress,
  menuItems,
  menuDisabled = false,
}: IHeaderSecondaryProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hasMenu = !!menuItems?.length;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <SafeAreaView edges={['top']} className='bg-black-700'>
        <StatusBar style='light' />
        <View
          className='flex-row items-center px-3'
          style={{ height: HEADER_HEIGHT }}
        >
          <Pressable
            onPress={onBackPress ?? (() => router.back())}
            className='h-10 w-10 items-center justify-center'
            accessibilityRole='button'
            accessibilityLabel='Voltar'
          >
            <ChevronLeft size={22} color={colors.white} />
          </Pressable>

          <AppText
            color='white'
            weight='medium'
            className='flex-1'
            numberOfLines={1}
          >
            {title}
          </AppText>
            {hasMenu && (
              <Pressable
                onPress={() => setIsMenuOpen(true)}
                disabled={menuDisabled}
                className={`h-10 w-10 items-center justify-center ${
                  menuDisabled ? 'opacity-40' : ''
                }`}
                accessibilityRole="button"
                accessibilityLabel="Mais opções"
              >
                <MoreVertical size={22} color={colors.white} />
              </Pressable>
            )}
        </View>
      </SafeAreaView>

      {hasMenu && (
        <ActionMenu
          visible={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          items={menuItems ?? []}
          topOffset={HEADER_HEIGHT - 4}
        />
      )}
    </>
  );
}
