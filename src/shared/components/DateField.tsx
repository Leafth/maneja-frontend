import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { DatePickerDialog, Host } from '@expo/ui/jetpack-compose';
import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import colors from '@/styles/colors';

/** "DD/MM/AAAA" → Date local, ou null se o texto não for uma data válida. */
function parseBrDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);

  return date.getDate() === day && date.getMonth() === month - 1 ? date : null;
}

// O calendário do Android (Material 3) trabalha com dias em UTC; estas funções
// convertem de/para o dia local, como faz o datetime-picker do @expo/ui.
function localDayToUtcIso(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  ).toISOString();
}

function utcDayToLocalDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

// Cores fixas no tema claro do app: sem isso o Material 3 usa o tema do
// aparelho (ex.: modo escuro) e os dias ficam ilegíveis.
const androidCalendarColors = {
  containerColor: colors.white,
  titleContentColor: colors.neutral.textMuted,
  headlineContentColor: colors.neutral.textHead,
  weekdayContentColor: colors.neutral.textMuted,
  subheadContentColor: colors.neutral.textBody,
  navigationContentColor: colors.neutral.textBody,
  yearContentColor: colors.neutral.textBody,
  disabledYearContentColor: colors.gray[600],
  currentYearContentColor: colors.forestGreen[500],
  selectedYearContentColor: colors.white,
  selectedYearContainerColor: colors.forestGreen[500],
  dayContentColor: colors.neutral.textHead,
  disabledDayContentColor: colors.gray[600],
  selectedDayContentColor: colors.white,
  selectedDayContainerColor: colors.forestGreen[500],
  todayContentColor: colors.forestGreen[500],
  todayDateBorderColor: colors.forestGreen[500],
  dividerColor: colors.neutral.border,
};

function formatBrDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}

interface IDateFieldProps {
  /** Data no formato DD/MM/AAAA (string vazia quando não preenchida). */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** Injetado pelo FormGroup quando há erro. */
  error?: boolean;
}

export function DateField({
  value,
  onChange,
  onBlur,
  placeholder = 'Selecionar data',
  minimumDate,
  maximumDate,
  disabled,
  accessibilityLabel = 'Selecionar data',
  error,
}: IDateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseBrDate(value) ?? new Date());

  function open() {
    setDraft(parseBrDate(value) ?? new Date());
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    onBlur?.();
  }

  function select(date: Date) {
    onChange(formatBrDate(date));
    close();
  }

  return (
    <View>
      <Pressable
        onPress={open}
        disabled={disabled}
        accessibilityRole='button'
        accessibilityLabel={`${accessibilityLabel}: ${value || 'não informada'}`}
        accessibilityState={{ disabled, expanded: isOpen }}
        className={`h-[52px] flex-row items-center justify-between rounded-[10px] border bg-white px-[14px] ${
          error ? 'border-support-red' : 'border-gray-400'
        } ${disabled ? 'opacity-40' : ''}`}
      >
        <AppText color={value ? 'default' : 'muted'}>
          {value || placeholder}
        </AppText>

        <CalendarDays size={18} color={colors.black[700]} />
      </Pressable>

      {/* Android: o calendário abre como diálogo nativo ao montar. */}
      {isOpen && Platform.OS === 'android' && (
        <Host>
          <DatePickerDialog
            initialDate={localDayToUtcIso(draft)}
            // A data por extenso no topo quebra de linha em alguns meses e
            // muda a altura do diálogo; o dia selecionado já aparece no calendário.
            showHeadline={false}
            selectableDates={{ start: minimumDate, end: maximumDate }}
            color={colors.forestGreen[500]}
            elementColors={androidCalendarColors}
            confirmButtonLabel='Confirmar'
            dismissButtonLabel='Cancelar'
            onDateSelected={(date) => select(utcDayToLocalDate(date))}
            onDismissRequest={close}
          />
        </Host>
      )}

      {/* iOS: o seletor é sempre embutido, então fica dentro de um modal. */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={isOpen}
          transparent
          animationType='fade'
          statusBarTranslucent
          onRequestClose={close}
        >
          <View className='flex-1 justify-end'>
            <Pressable
              className='absolute inset-0 bg-black-900/40'
              onPress={close}
              accessibilityRole='button'
              accessibilityLabel='Fechar calendário'
            />

            <View className='gap-4 rounded-t-[20px] bg-white px-4 pb-10 pt-4'>
              <DateTimePicker
                value={draft}
                mode='date'
                display='inline'
                locale='pt_BR'
                themeVariant='light'
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                accentColor={colors.forestGreen[500]}
                onValueChange={(_, date) => setDraft(date)}
              />

              <View className='flex-row gap-3'>
                <View className='flex-1'>
                  <Button variant='secondary' size='md' onPress={close}>
                    Cancelar
                  </Button>
                </View>

                <View className='flex-1'>
                  <Button size='md' onPress={() => select(draft)}>
                    Confirmar
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
