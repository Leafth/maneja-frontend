import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { FormGroup } from '@/shared/components/FormGroup';
import colors from '@/styles/colors';

import type { FeedType } from '../models/feed-stock.model';

interface PickerFieldProps {
  types: FeedType[];
  value: string;
  onChange: (id: string) => void;
  error?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

function PickerField({ types, value, onChange, error, open, setOpen }: PickerFieldProps) {
  const selected = types.find((type) => type.id === value);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityLabel="Selecionar ração"
        className={`h-[52px] flex-row items-center justify-between rounded-[10px] border bg-white px-[14px] ${error ? 'border-support-red' : 'border-gray-400'}`}
      >
        <AppText color={selected ? 'default' : 'muted'}>{selected?.name ?? 'Selecionar ração'}</AppText>
        <ChevronDown size={18} color={colors.black[700]} />
      </Pressable>

      {open && (
        <View
          className="absolute left-0 right-0 top-[56px] overflow-hidden rounded-[10px] border border-gray-400 bg-white"
          style={{ elevation: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
        >
          <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }} keyboardShouldPersistTaps="always">
            {types.map((type) => (
              <Pressable
                key={type.id}
                className="border-b border-gray-300 px-4 py-4"
                onPress={() => { onChange(type.id); setOpen(false); }}
                accessibilityRole="button"
              >
                <AppText>{type.name}</AppText>
              </Pressable>
            ))}
            {types.length === 0 && <AppText color="muted" className="px-4 py-4">Nenhum tipo de ração cadastrado.</AppText>}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

interface Props extends Omit<PickerFieldProps, 'error' | 'open' | 'setOpen'> {
  error?: string;
}

export function FeedTypePicker({ error, ...props }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ zIndex: open ? 20 : 0 }}>
      <FormGroup label="Tipo de ração" required error={error}>
        <PickerField {...props} open={open} setOpen={setOpen} />
      </FormGroup>
    </View>
  );
}
