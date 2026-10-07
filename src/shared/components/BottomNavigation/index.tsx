import { Beef, House, Mountain, Wheat } from 'lucide-react-native';
import { useRouter, type Href } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';

import { bottomNavigationStyles } from './styles';

interface IBottomNavigationProps {
  activeItem?: 'home' | 'herd' | 'lands' | 'feeding';
}

const items = [
  {
    key: 'home',
    label: 'Início',
    icon: House,
    route: '/home',
  },
  {
    key: 'herd',
    label: 'Rebanho',
    icon: Beef,
    route: '/herd',
  },
  {
    key: 'lands',
    label: 'Terrenos',
    icon: Mountain,
    route: '/lands',
  },
  {
    key: 'feeding',
    label: 'Alimentação',
    icon: Wheat,
    route: '/feeding',
  },
] as const;

export function BottomNavigation({
  activeItem = 'home',
}: IBottomNavigationProps) {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const styles = bottomNavigationStyles();

  return (
    <View className={styles.container()} style={{ paddingBottom: bottom }}>
      <View className={styles.items()}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              className={styles.item()}
              onPress={() => router.replace(item.route as Href)}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.2 : 1.5}
                color={isActive ? '#65A30D' : '#737373'}
              />

              <AppText
                size='xs'
                weight={isActive ? 'medium' : 'regular'}
                color={isActive ? 'primary' : 'muted'}
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
