import { Minus, Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

import type { FeedMovement } from '../models/feed-movement.model';
import { scaledToDisplay } from '../utils/feed-decimal';

interface FeedHistoryItemProps {
  movement: FeedMovement;
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-');

  return `${day}/${month}/${year}`;
}

export function FeedHistoryItem({ movement }: FeedHistoryItemProps) {
  const isEntry = movement.movementType === 'entry';

  return (
    <View className='flex-row items-center py-4'>
      <View
        className={`mr-4 h-12 w-12 items-center justify-center rounded-[10px] ${
          isEntry ? 'bg-support-success-bg' : 'bg-support-danger-bg'
        }`}
      >
        {isEntry ? (
          <Plus size={22} color={colors.support.success.solid} strokeWidth={2} />
        ) : (
          <Minus size={22} color={colors.support.danger.solid} strokeWidth={2} />
        )}
      </View>

      <View className='flex-1'>
        <AppText className='text-neutral-textBody'>
          {isEntry ? 'Entrada' : 'Saída'}
        </AppText>

        <AppText size='sm' className='mt-1 text-neutral-textMuted'>
          {formatDate(movement.occurredOn)}
          {' – '}
          {isEntry
            ? `Valor: ${scaledToDisplay(movement.valueScaled)}`
            : movement.reason}
        </AppText>
      </View>

      <AppText
        weight='semiBold'
        className={
          isEntry ? 'text-support-success-text' : 'text-support-danger-text'
        }
      >
        {isEntry ? '+' : '−'}
        {scaledToDisplay(movement.quantityScaled)}
      </AppText>
    </View>
  );
}
