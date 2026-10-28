import { Controller } from 'react-hook-form';

import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';

import { FeedActionButton } from '../components/FeedActionButton';
import { FeedFormLayout } from '../components/FeedFormLayout';
import { FeedTypePicker } from '../components/FeedTypePicker';
import { useStockExitViewModel } from '../viewmodels/use-stock-exit-view-model';

export default function StockExitView() {
  const { control, types, selectedTypeId, selectType, onSubmit, goBack } = useStockExitViewModel();

  return (
    <FeedFormLayout title="Saída de Estoque" onBack={goBack}>
      <Controller control={control} name="typeId" render={({ fieldState }) => (
        <FeedTypePicker types={types} value={selectedTypeId} onChange={selectType} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="quantityKg" render={({ field, fieldState }) => (
        <FormGroup label="Quantidade" required error={fieldState.error?.message}>
          <Input placeholder="80" suffix="kg" keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
        </FormGroup>
      )} />
      <Controller control={control} name="reason" render={({ field, fieldState }) => (
        <FormGroup label="Motivo" required error={fieldState.error?.message}>
          <Input placeholder="Perda" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="sentences" />
        </FormGroup>
      )} />
      <FeedActionButton onPress={onSubmit}>Registrar Saída</FeedActionButton>
    </FeedFormLayout>
  );
}
