import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

export interface SelectOption {
  value: string;
  label: string;
}

interface ISelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  emptyMessage?: string;
  error?: boolean;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder,
  emptyMessage = 'Nenhuma opção disponível.',
  error,
  disabled,
}: ISelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={{ zIndex: open ? 20 : 0 }}>
      <Pressable
        onPress={() => setOpen(!open)}
        disabled={disabled}
        accessibilityRole='button'
        accessibilityLabel={selected?.label ?? placeholder}
        accessibilityState={{ expanded: open, disabled }}
        className={`h-[52px] flex-row items-center justify-between rounded-[10px] border bg-white px-[14px] ${
          error ? 'border-support-red' : 'border-gray-400'
        } ${disabled ? 'opacity-40' : ''}`}
      >
        <AppText
          color={selected ? 'default' : 'muted'}
          className='flex-1'
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </AppText>

        <ChevronDown size={18} color={colors.black[700]} />
      </Pressable>

      {open && (
        <View
          className='absolute left-0 right-0 top-[56px] overflow-hidden rounded-[10px] border border-gray-400 bg-white'
          style={{
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <ScrollView
            nestedScrollEnabled
            style={{ maxHeight: 220 }}
            keyboardShouldPersistTaps='always'
          >
            {options.map((option) => (
              <Pressable
                key={option.value}
                className='border-b border-gray-300 px-4 py-4'
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                accessibilityRole='button'
                accessibilityState={{ selected: option.value === value }}
              >
                <AppText>{option.label}</AppText>
              </Pressable>
            ))}

            {options.length === 0 && (
              <AppText color='muted' className='px-4 py-4'>
                {emptyMessage}
              </AppText>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
