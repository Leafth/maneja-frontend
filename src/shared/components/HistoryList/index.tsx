import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';

import type { HistoryItem } from '@/shared/models';

interface IHistoryListProps {
  title: string;
  items: HistoryItem[];
  emptyMessage: string;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}

export function HistoryList({
  title,
  items,
  emptyMessage,
  isLoading,
  hasError,
  onRetry,
}: IHistoryListProps) {
  return (
    <View>
      <AppText className='text-neutral-textMuted'>{title}</AppText>

      {isLoading ? (
        <ActivityIndicator className='mt-4' />
      ) : hasError ? (
        <View className='mt-4 gap-4'>
          <AppText size='sm' color='error'>
            Não foi possível carregar o histórico.
          </AppText>

          <Button size='md' variant='secondary' onPress={onRetry}>
            Tentar novamente
          </Button>
        </View>
      ) : items.length === 0 ? (
        <AppText size='sm' color='muted' className='mt-4'>
          {emptyMessage}
        </AppText>
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            className='gap-1 border-b border-neutral-border px-4 py-4'
          >
            <AppText className='text-neutral-textBody'>{item.title}</AppText>

            <AppText weight='medium' className='text-neutral-textMuted'>
              {item.period}
            </AppText>
          </View>
        ))
      )}
    </View>
  );
}
