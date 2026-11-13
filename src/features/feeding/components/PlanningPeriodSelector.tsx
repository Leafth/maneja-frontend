import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Input } from '@/shared/components/Input';

import type { PlanningPeriod } from '../schemas/feed-planning.schema';

const periodOptions: { value: PlanningPeriod; label: string }[] = [
  { value: '7', label: '7\ndias' },
  { value: '15', label: '15\ndias' },
  { value: '30', label: '30\ndias' },
  { value: 'custom', label: 'Outro' },
];

interface IPlanningPeriodSelectorProps {
  value: PlanningPeriod;
  onChange: (value: PlanningPeriod) => void;
  customDays: string;
  onChangeCustomDays: (value: string) => void;
  onBlurCustomDays?: () => void;
  /** Injetado pelo FormGroup quando há erro no número de dias. */
  error?: boolean;
}

export function PlanningPeriodSelector({
  value,
  onChange,
  customDays,
  onChangeCustomDays,
  onBlurCustomDays,
  error,
}: IPlanningPeriodSelectorProps) {
  return (
    <View className='gap-3'>
      <View accessibilityRole='radiogroup' className='flex-row gap-3'>
        {periodOptions.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole='radio'
              accessibilityState={{ selected }}
              accessibilityLabel={option.label.replace('\n', ' ')}
              className={`h-14 flex-1 items-center justify-center rounded-[12px] border ${
                selected
                  ? 'border-forestGreen-600 bg-forestGreen-100'
                  : 'border-neutral-border bg-white'
              }`}
            >
              <AppText
                size='sm'
                align='center'
                weight={selected ? 'medium' : 'regular'}
                className='text-neutral-textHead'
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {value === 'custom' && (
        <Input
          placeholder='Ex.: 45'
          suffix='dias'
          keyboardType='number-pad'
          value={customDays}
          onChangeText={onChangeCustomDays}
          onBlur={onBlurCustomDays}
          error={error}
          autoFocus
          returnKeyType='done'
        />
      )}
    </View>
  );
}
