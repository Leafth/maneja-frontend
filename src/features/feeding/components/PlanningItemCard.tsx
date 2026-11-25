import { Check, TriangleAlert } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface IPlanningItemCardProps {
  feedName: string;
  requiredLabel: string;
  stockLabel: string;
  missingLabel: string;
  remainingLabel: string;
  coverage: number;
  sufficient: boolean;
}

interface IQuantityProps {
  label: string;
  value: string;
}

function Quantity({ label, value }: IQuantityProps) {
  return (
    <View className='flex-1 gap-1'>
      <AppText weight='medium' className='text-neutral-textHead'>
        {label}
      </AppText>

      <AppText className='text-neutral-textMuted'>{value}</AppText>
    </View>
  );
}

export function PlanningItemCard({
  feedName,
  requiredLabel,
  stockLabel,
  missingLabel,
  remainingLabel,
  coverage,
  sufficient,
}: IPlanningItemCardProps) {
  const progress = Math.max(0, Math.min(coverage, 1));

  return (
    <View className='gap-3 rounded-[14px] border border-neutral-border bg-neutral-card p-2'>
      <AppText weight='medium' className='px-2 pt-2 text-neutral-textHead'>
        {feedName}
      </AppText>

      <View className='gap-4 rounded-[10px] bg-neutral-surface p-3'>
        <View className='flex-row gap-3'>
          <Quantity label='Necessário' value={requiredLabel} />

          <Quantity label='Estoque' value={stockLabel} />
        </View>

        <View
          accessibilityRole='progressbar'
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(progress * 100),
          }}
          className='h-1.5 overflow-hidden rounded-full bg-gray-400'
        >
          <View
            className={`h-full rounded-full ${
              sufficient
                ? 'bg-support-success-solid'
                : 'bg-support-danger-solid'
            }`}
            style={{
              width: `${progress * 100}%`,
            }}
          />
        </View>
      </View>

      <View
        className={`flex-row items-center gap-2 rounded-[10px] border px-3 py-3 ${
          sufficient
            ? 'border-support-success-border bg-support-success-bg'
            : 'border-support-danger-border bg-support-danger-bg'
        }`}
      >
        {sufficient ? (
          <Check
            size={16}
            strokeWidth={2}
            color={colors.support.success.solid}
          />
        ) : (
          <TriangleAlert
            size={16}
            strokeWidth={2}
            color={colors.support.danger.solid}
          />
        )}

        <AppText
          size='sm'
          weight='medium'
          className={
            sufficient
              ? 'text-support-success-text'
              : 'text-support-danger-text'
          }
        >
          {sufficient
            ? `Estoque suficiente · sobra ${remainingLabel}`
            : `Faltam ${missingLabel}`}
        </AppText>
      </View>
    </View>
  );
}
