import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

const HEADER_HEIGHT = 56;

export interface IHeaderMenuItem {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

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
  const { top } = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hasMenu = !!menuItems?.length;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleItemPress(item: IHeaderMenuItem) {
    closeMenu();
    item.onPress();
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

          {hasMenu ? (
            <Pressable
              onPress={() => setIsMenuOpen(true)}
              disabled={menuDisabled}
              className={`h-10 w-10 items-center justify-center ${
                menuDisabled ? 'opacity-40' : ''
              }`}
              accessibilityRole='button'
              accessibilityLabel='Mais opções'
            >
              <MoreVertical size={22} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>

      {hasMenu ? (
        <Modal
          transparent
          visible={isMenuOpen}
          animationType='fade'
          statusBarTranslucent
          onRequestClose={closeMenu}
        >
          <Pressable className='flex-1' onPress={closeMenu}>
            <View
              className='absolute right-3 w-[180px] overflow-hidden rounded-[10px] border border-gray-400 bg-white'
              style={{ top: top + HEADER_HEIGHT - 4 }}
            >
              {menuItems.map((item, index) => (
                <View key={item.label}>
                  {index > 0 ? <View className='h-px bg-gray-400' /> : null}
                  <Pressable
                    onPress={() => handleItemPress(item)}
                    className='px-4 py-3'
                  >
                    <AppText size='sm' color={item.destructive ? 'error' : undefined}>
                      {item.label}
                    </AppText>
                  </Pressable>
                </View>
              ))}
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}
