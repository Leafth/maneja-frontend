import { CalendarDays } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';
import colors from '@/styles/colors';

import { FeedActionButton } from '../components/FeedActionButton';
import { FeedFormLayout } from '../components/FeedFormLayout';
import { FeedTypePicker } from '../components/FeedTypePicker';
import { useStockEntryViewModel } from '../viewmodels/use-stock-entry-view-model';

export default function StockEntryView() {
  const { control, types, selectedTypeId, selectType, onSubmit, goBack } = useStockEntryViewModel();

  return (
    <FeedFormLayout title="Entrada de Estoque" onBack={goBack}>
      <Controller control={control} name="typeId" render={({ fieldState }) => (
        <FeedTypePicker types={types} value={selectedTypeId} onChange={selectType} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="quantityKg" render={({ field, fieldState }) => (
        <FormGroup label="Quantidade" required error={fieldState.error?.message}>
          <Input placeholder="80" suffix="kg" keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
        </FormGroup>
      )} />
      <View className="gap-1">
        <Controller control={control} name="value" render={({ field, fieldState }) => (
          <FormGroup label="Valor" required error={fieldState.error?.message}>
            <Input placeholder="80" suffix="R$" keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
          </FormGroup>
        )} />
        <AppText size="xs" color="muted">Valor da compra total</AppText>
      </View>
      <Controller control={control} name="date" render={({ field, fieldState }) => (
        <FormGroup label="Data" required error={fieldState.error?.message}>
          <View className="flex-row items-center rounded-[10px] border border-gray-400 pr-3">
            <Input className="flex-1 border-0" placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
            <CalendarDays size={18} color={colors.black[700]} />
          </View>
        </FormGroup>
      )} />
      <FeedActionButton onPress={onSubmit}>Registrar Entrada</FeedActionButton>
    </FeedFormLayout>
  );
}
