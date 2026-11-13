import { Controller } from 'react-hook-form';
import { Keyboard, Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { Select } from '@/shared/components/Select';

import { PlanningPeriodSelector } from '../components/PlanningPeriodSelector';
import { useFeedPlanningViewModel } from '../viewmodels/use-feed-planning-view-model';

/** Conteúdo da aba "Planejamento" da tela de alimentação. */
export default function FeedPlanningSection() {
  const {
    control,
    groupOptions,
    handlePeriodChange,
    isGroupsLoading,
    hasGroupsError,
    retryGroups,
    canSubmit,
    isSubmitting,
    submitError,
    onSubmit,
  } = useFeedPlanningViewModel();

  return (
    // Tocar fora dos campos fecha o teclado (o numérico do iOS não tem "OK").
    <Pressable
      onPress={Keyboard.dismiss}
      accessible={false}
      className='mt-6 flex-1 gap-5'
    >
      <AppText className='text-neutral-textMuted'>
        Veja quanta ração seus animais vão precisar e se o seu estoque é
        suficiente.
      </AppText>

      <Controller
        control={control}
        name='customDays'
        render={({ field, fieldState }) => (
          <FormGroup label='Período' required error={fieldState.error?.message}>
            <Controller
              control={control}
              name='period'
              render={({ field: periodField }) => (
                <PlanningPeriodSelector
                  value={periodField.value}
                  onChange={handlePeriodChange}
                  customDays={field.value}
                  onChangeCustomDays={field.onChange}
                  onBlurCustomDays={field.onBlur}
                />
              )}
            />
          </FormGroup>
        )}
      />

      {hasGroupsError ? (
        <View className='gap-3'>
          <AppText size='sm' color='error'>
            Não foi possível carregar os grupos.
          </AppText>

          <Button variant='secondary' size='md' onPress={retryGroups}>
            Tentar novamente
          </Button>
        </View>
      ) : (
        <Controller
          control={control}
          name='groupLocalId'
          render={({ field, fieldState }) => (
            <FormGroup label='Grupo' required error={fieldState.error?.message}>
              <Select
                options={groupOptions}
                value={field.value || null}
                onChange={field.onChange}
                placeholder={
                  isGroupsLoading ? 'Carregando grupos...' : 'Selecionar grupo'
                }
                emptyMessage='Nenhum grupo cadastrado.'
                disabled={isGroupsLoading}
              />
            </FormGroup>
          )}
        />
      )}

      {submitError && (
        <AppText size='sm' color='error'>
          {submitError}
        </AppText>
      )}

      <Button
        isLoading={isSubmitting}
        disabled={!canSubmit || isSubmitting}
        onPress={onSubmit}
      >
        Calcular Planejamento
      </Button>
    </Pressable>
  );
}
