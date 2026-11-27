import { Wifi, WifiOff } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

import { onlineStatusStyles } from './styles';

interface IOnlineStatusProps {
  isOnline?: boolean;
}

export function OnlineStatus({ isOnline = true }: IOnlineStatusProps) {
  const styles = onlineStatusStyles();

  return (
    <View className={styles.container()}>
      {isOnline ? (
        <Wifi size={20} strokeWidth={2} color={colors.black[700]} />
      ) : (
        <WifiOff size={20} strokeWidth={2} color={colors.black[700]} />
      )}

      <AppText size='base' weight='medium' className={styles.text()}>
        {isOnline ? 'Online' : 'Offline'}
      </AppText>
    </View>
  );
}
