import { Controller } from 'react-hook-form';

import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';

import { FeedActionButton } from '../components/FeedActionButton';
import { FeedFormLayout } from '../components/FeedFormLayout';
import { useFeedTypeFormViewModel } from '../viewmodels/use-feed-type-form-view-model';

export default function FeedTypeFormView() {
  const { control, onSubmit, goBack } = useFeedTypeFormViewModel();

  return (
    <FeedFormLayout title="Tipos de Ração" onBack={goBack}>
      <Controller control={control} name="name" render={({ field, fieldState }) => (
        <FormGroup label="Nome da ração" required error={fieldState.error?.message}>
          <Input placeholder="Soja" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} autoCapitalize="sentences" />
        </FormGroup>
      )} />
      <Controller control={control} name="initialKg" render={({ field, fieldState }) => (
        <FormGroup label="Estoque inicial" required error={fieldState.error?.message}>
          <Input placeholder="80" suffix="kg" keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
        </FormGroup>
      )} />
      <FeedActionButton onPress={onSubmit}>Registrar Tipo</FeedActionButton>
    </FeedFormLayout>
  );
}
