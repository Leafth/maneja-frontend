import { Controller } from 'react-hook-form';

import { DateField } from '@/shared/components/DateField';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';

import { FeedActionButton } from '../components/FeedActionButton';
import { FeedFormLayout } from '../components/FeedFormLayout';
import { FeedTypePicker } from '../components/FeedTypePicker';
import { useStockExitViewModel } from '../viewmodels/use-stock-exit-view-model';

export default function StockExitView() {
  const {
    control,
    types,
    isTypeLocked,
    lockedTypeName,
    selectedTypeId,
    selectType,
    onSubmit,
    goBack,
  } = useStockExitViewModel();

  return (
    <FeedFormLayout
      title={lockedTypeName ? `Saída · ${lockedTypeName}` : 'Saída de Estoque'}
      onBack={goBack}
    >
      {!isTypeLocked && (
        <Controller
          control={control}
          name='typeId'
          render={({ fieldState }) => (
            <FeedTypePicker
              types={types}
              value={selectedTypeId}
              onChange={selectType}
              error={fieldState.error?.message}
            />
          )}
        />
      )}

      <Controller
        control={control}
        name='quantity'
        render={({ field, fieldState }) => (
          <FormGroup
            label='Quantidade'
            required
            error={fieldState.error?.message}
          >
            <Input
              placeholder='80'
              suffix='kg'
              keyboardType='decimal-pad'
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          </FormGroup>
        )}
      />

      <Controller
        control={control}
        name='reason'
        render={({ field, fieldState }) => (
          <FormGroup label='Motivo' required error={fieldState.error?.message}>
            <Input
              placeholder='Perda'
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize='sentences'
            />
          </FormGroup>
        )}
      />

      <Controller
        control={control}
        name='date'
        render={({ field, fieldState }) => (
          <FormGroup label='Data' required error={fieldState.error?.message}>
            <DateField
              accessibilityLabel='Data da saída'
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maximumDate={new Date()}
            />
          </FormGroup>
        )}
      />

      <FeedActionButton onPress={onSubmit}>Registrar Saída</FeedActionButton>
    </FeedFormLayout>
  );
}
