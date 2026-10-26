import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Beef, House, Mountain, Wheat } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';

import { useRouter } from 'expo-router';
import { bottomNavigationStyles } from './styles';

const ITEMS = {
  home: { label: 'Início', icon: House },
  herd: { label: 'Rebanho', icon: Beef },
  terrains: { label: 'Terrenos', icon: Mountain },
  feeding: { label: 'Alimentação', icon: Wheat },
} as const;

type ItemKey = keyof typeof ITEMS;

export function BottomNavigation({ state }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const styles = bottomNavigationStyles();
  const router = useRouter();

  return (
    <View className={styles.container()} style={{ paddingBottom: bottom }}>
      <View className={styles.items()}>
        {state.routes.map((route, index) => {
          const item = ITEMS[route.name as ItemKey];
          if (!item) {return null;}

          const Icon = item.icon;
          const isActive = state.index === index;

          const handlePress = () => {
            if (!isActive) {
              router.navigate(`/${route.name}` as never);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              className={styles.item()}
              onPress={handlePress}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.2 : 1.5}
                color={isActive ? '#1B4332' : '#737373'}
              />

              <AppText
                size='xs'
                weight={isActive ? 'medium' : 'regular'}
                color={isActive ? 'bottomNavigation' : 'muted'}
                align='center'
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
