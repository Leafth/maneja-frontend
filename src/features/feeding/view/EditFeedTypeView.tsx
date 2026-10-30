import { Controller } from 'react-hook-form';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';

import { FeedFormLayout } from '../components/FeedFormLayout';
import { scaledToDisplay } from '../utils/feed-decimal';
import { useEditFeedTypeViewModel } from '../viewmodels/use-edit-feed-type-view-model';

export default function EditFeedTypeView() {
  const {
    control,
    feed,
    onSubmit,
    goBack,
    isLoading,
    isUnavailable,
    loadError,
    retry,
    error,
    isValid,
    isSubmitting,
  } = useEditFeedTypeViewModel();

  return (
    <FeedFormLayout title='Editar tipo de ração' onBack={goBack}>
      {isLoading ? (
        <ActivityIndicator />
      ) : loadError ? (
        <View className='gap-4'>
          <AppText color='error'>Não foi possível carregar o tipo de ração.</AppText>
          <Button onPress={retry}>Tentar novamente</Button>
        </View>
      ) : isUnavailable ? (
        <AppText color='muted'>Tipo de ração não encontrado.</AppText>
      ) : feed ? (
        <>
          <Controller
            control={control}
            name='name'
            render={({ field, fieldState }) => (
              <FormGroup label='Nome da ração' required error={fieldState.error?.message}>
                <Input
                  placeholder='Soja'
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  disabled={isSubmitting}
                  autoCapitalize='sentences'
                />
              </FormGroup>
            )}
          />

          <FormGroup label='Estoque atual'>
            <Input value={scaledToDisplay(feed.projectedStockScaled)} suffix='kg' disabled />
          </FormGroup>

          <AppText size='sm' color='muted'>
            Para alterar o estoque, registre uma entrada ou saída.
          </AppText>

          {error && (
            <AppText size='sm' color='error'>
              Não foi possível atualizar o tipo de ração. Tente novamente.
            </AppText>
          )}

          <Button
            onPress={() => {
              void onSubmit();
            }}
            isLoading={isSubmitting}
            disabled={!isValid || isSubmitting}
          >
            Salvar alterações
          </Button>
        </>
      ) : null}
    </FeedFormLayout>
  );
}
