import { Minus, Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

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
        className='mr-4 h-12 w-12 items-center justify-center rounded-md'
        style={{
          backgroundColor: isEntry ? '#10B981' : '#F83D45',
        }}
      >
        {isEntry ? (
          <Plus size={22} color='#FFFFFF' strokeWidth={2} />
        ) : (
          <Minus size={22} color='#FFFFFF' strokeWidth={2} />
        )}
      </View>

      <View className='flex-1'>
        <AppText color='muted'>{isEntry ? 'Entrada' : 'Saída'}</AppText>

        <AppText size='sm' weight='semiBold' color='muted' className='mt-1'>
          {formatDate(movement.occurredOn)}
          {' – '}
          {isEntry
            ? `Valor: ${scaledToDisplay(movement.valueScaled)}`
            : movement.reason}
        </AppText>
      </View>

      <AppText
        weight='semiBold'
        style={{
          color: isEntry ? '#10B981' : '#F83D45',
        }}
      >
        {isEntry ? '+' : '−'}
        {scaledToDisplay(movement.quantityScaled)}
      </AppText>
    </View>
  );
}
