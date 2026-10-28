import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface ISegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: ISegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole='tablist'
      className='flex-row rounded-[12px] bg-gray-300 p-1'
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole='tab'
            accessibilityState={{ selected }}
            className={`h-12 flex-1 items-center justify-center rounded-[10px] ${
              selected ? 'bg-forestGreen-500' : ''
            }`}
          >
            <AppText
              weight='medium'
              className={selected ? 'text-white' : 'text-neutral-textMuted'}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
