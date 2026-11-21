import { ChevronDown } from 'lucide-react-native';
import { type ComponentRef, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';

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

const LIST_MAX_HEIGHT = 220;
const LIST_OFFSET = 4;
const SCREEN_MARGIN = 16;

interface TriggerLayout {
  x: number;
  y: number;
  width: number;
  height: number;
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
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const [layout, setLayout] = useState<TriggerLayout | null>(null);
  const { height: windowHeight } = useWindowDimensions();

  const open = layout !== null;
  const selected = options.find((option) => option.value === value);

  function close() {
    setLayout(null);
  }

  // A lista abre num Modal: tocar fora dela fecha, e ela não fica cortada
  // por ScrollViews ou atrás de outros elementos da tela.
  function toggle() {
    if (open) {
      close();
      return;
    }

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
    });
  }

  function select(optionValue: string) {
    onChange(optionValue);
    close();
  }

  const opensUpward =
    layout !== null &&
    layout.y + layout.height + LIST_OFFSET + LIST_MAX_HEIGHT >
      windowHeight - SCREEN_MARGIN;

  return (
    <View>
      <Pressable
        ref={triggerRef}
        onPress={toggle}
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

      <Modal
        visible={open}
        transparent
        animationType='fade'
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable
          className='flex-1'
          onPress={close}
          accessibilityRole='button'
          accessibilityLabel='Fechar lista de opções'
        />

        {layout && (
          <View
            className='absolute overflow-hidden rounded-[10px] border border-gray-400 bg-white'
            style={{
              left: layout.x,
              width: layout.width,
              ...(opensUpward
                ? { bottom: windowHeight - layout.y + LIST_OFFSET }
                : { top: layout.y + layout.height + LIST_OFFSET }),
              elevation: 8,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <ScrollView
              style={{ maxHeight: LIST_MAX_HEIGHT }}
              keyboardShouldPersistTaps='always'
            >
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  className='border-b border-gray-300 px-4 py-4'
                  onPress={() => select(option.value)}
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
      </Modal>
    </View>
  );
}
