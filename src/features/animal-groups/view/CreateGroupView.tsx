import { Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { HeaderPrimary, HeaderSecondary } from '@/shared/components/Header';
import { Input } from '@/shared/components/Input';

import { useCreateGroupViewModel } from '../viewmodels/use-create-group-view-model';

export default function CreateGroupView() {
  const {
    control,
    onSubmit,
    goBack,
    isValid,
    isSubmitting,
    isEditing,
    isOnline,
    isLoading,
    isUnavailable,
    loadError,
    error,
    retry,
  } = useCreateGroupViewModel();

  return (
    <View className='flex-1 bg-white'>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {isEditing ? (
          <HeaderSecondary title='Atualizar grupo' onBackPress={goBack} />
        ) : (
          <HeaderPrimary isOnline={isOnline} />
        )}

        <SafeAreaView edges={isEditing ? ['bottom'] : []} className='flex-1'>
          <View className='px-4 pt-4'>
            <AppText size='sm' weight='medium' className='uppercase'>
              {isEditing ? 'ATUALIZAR GRUPO' : 'NOVO GRUPO'}
            </AppText>

            <AppText size='sm' color='muted' className='mt-3'>
              {isEditing ? 'Atualize seu grupo' : 'Cadastre um novo grupo'}
            </AppText>

            {isLoading ? (
              <ActivityIndicator className='mt-5' />
            ) : loadError ? (
              <View className='mt-5 gap-4'>
                <AppText color='error'>Não foi possível carregar o grupo.</AppText>
                <Button onPress={retry}>Tentar novamente</Button>
              </View>
            ) : isUnavailable ? (
              <AppText className='mt-5'>Grupo de animais não encontrado.</AppText>
            ) : (
              <View className='mt-5 gap-4'>
                <Controller
                  control={control}
                  name='name'
                  render={({ field, fieldState }) => (
                    <FormGroup
                      label='Nome do grupo'
                      required
                      error={fieldState.error?.message}
                    >
                      <Input
                        placeholder='Vacas em lactação'
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        error={!!fieldState.error}
                        disabled={isSubmitting}
                        autoCapitalize='sentences'
                        autoCorrect={false}
                        returnKeyType='next'
                      />
                    </FormGroup>
                  )}
                />

                <Controller
                  control={control}
                  name='animalCount'
                  render={({ field, fieldState }) => (
                    <FormGroup
                      label='Quantidade de animais'
                      required
                      error={fieldState.error?.message}
                    >
                      <Input
                        placeholder='50'
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        error={!!fieldState.error}
                        disabled={isSubmitting}
                        keyboardType='number-pad'
                        returnKeyType='done'
                        onSubmitEditing={onSubmit}
                      />
                    </FormGroup>
                  )}
                />

                {error && (
                  <AppText size='sm' color='error'>
                    Não foi possível salvar o grupo. Tente novamente.
                  </AppText>
                )}

                <Button
                  onPress={onSubmit}
                  isLoading={isSubmitting}
                  disabled={!isValid || isSubmitting}
                  className='mt-1'
                >
                  {isEditing ? 'Salvar' : 'Cadastrar'}
                </Button>
              </View>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
