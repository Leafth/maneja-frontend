import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { DateField } from '@/shared/components/DateField';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';

import { FeedActionButton } from '../components/FeedActionButton';
import { FeedFormLayout } from '../components/FeedFormLayout';
import { FeedTypePicker } from '../components/FeedTypePicker';
import { useStockEntryViewModel } from '../viewmodels/use-stock-entry-view-model';

export default function StockEntryView() {
  const {
    control,
    types,
    isTypeLocked,
    lockedTypeName,
    selectedTypeId,
    selectType,
    onSubmit,
    goBack,
  } = useStockEntryViewModel();

  return (
    <FeedFormLayout
      title={lockedTypeName ? `Entrada · ${lockedTypeName}` : 'Entrada de Estoque'}
      onBack={goBack}
    >
      {!isTypeLocked && (
        <Controller control={control} name="typeId" render={({ fieldState }) => (
          <FeedTypePicker types={types} value={selectedTypeId} onChange={selectType} error={fieldState.error?.message} />
        )} />
      )}
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
          <DateField
            accessibilityLabel="Data da entrada"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            maximumDate={new Date()}
          />
        </FormGroup>
      )} />
      <FeedActionButton onPress={onSubmit}>Registrar Entrada</FeedActionButton>
    </FeedFormLayout>
  );
}
