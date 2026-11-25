import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface IFeedOverviewGroup {
  remoteId: string;
  localId: string | null;
  name: string;
  dailyRequiredLabel: string;
}

interface IFeedOverviewItemCardProps {
  feedName: string;

  requiredLabel: string;
  stockLabel: string;

  missingLabel: string;
  remainingLabel: string;

  coverage: number;
  sufficient: boolean;

  groups: IFeedOverviewGroup[];

  onGroupPress: (localId: string | null) => void;
}

export function FeedOverviewItemCard({
  feedName,

  requiredLabel,
  stockLabel,

  missingLabel,
  remainingLabel,

  coverage,
  sufficient,

  groups,

  onGroupPress,
}: IFeedOverviewItemCardProps) {
  const progress = Math.max(0, Math.min(coverage, 1));

  return (
    <View className='gap-3'>
      <View className='flex-row items-start justify-between gap-4'>
        <AppText weight='semiBold' className='flex-1 text-neutral-textHead'>
          {feedName}
        </AppText>

        <AppText
          weight='semiBold'
          className={
            sufficient
              ? 'text-support-success-text'
              : 'text-support-danger-solid'
          }
        >
          {sufficient ? `Sobram ${remainingLabel}` : `Faltam ${missingLabel}`}
        </AppText>
      </View>

      {!sufficient && (
        <>
          <View className='h-1.5 overflow-hidden rounded-full bg-gray-300'>
            <View
              className='h-full rounded-full bg-support-danger-solid'
              style={{
                width: `${progress * 100}%`,
              }}
            />
          </View>

          <AppText size='sm' className='text-neutral-textMuted'>
            Precisa de {requiredLabel} · tem {stockLabel}
          </AppText>
        </>
      )}

      {groups.map((group) => (
        <Pressable
          key={group.remoteId}
          disabled={!group.localId}
          onPress={() => onGroupPress(group.localId)}
          className='flex-row items-center justify-between py-1'
          accessibilityRole={group.localId ? 'button' : undefined}
        >
          <AppText
            size='sm'
            weight='medium'
            className='flex-1 text-neutral-textHead'
          >
            {group.name}
          </AppText>

          <View className='flex-row items-center gap-2'>
            <AppText size='sm' className='text-neutral-textMuted'>
              {group.dailyRequiredLabel}
            </AppText>

            {group.localId && (
              <ChevronRight size={16} color={colors.neutral.textMuted} />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
