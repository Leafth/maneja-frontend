import { Radio } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

import { onlineStatusStyles } from './styles';

interface IOnlineStatusProps {
  isOnline?: boolean;
}

export function OnlineStatus({
  isOnline = true,
}: IOnlineStatusProps) {
  const styles = onlineStatusStyles();

  return (
    <View className={styles.container()}>
      <Radio
        size={14}
        strokeWidth={2}
        color={colors.black[700]}
      />

      <AppText
        size='sm'
        weight='medium'
        className={styles.text()}
      >
        {isOnline ? 'Online' : 'Offline'}
      </AppText>
    </View>
  );
}
