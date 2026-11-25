import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { DismissKeyboardArea } from '@/shared/components/DismissKeyboardArea';
import { FormGroup } from '@/shared/components/FormGroup';
import { Select } from '@/shared/components/Select';

import { PlanningPeriodSelector } from '../components/PlanningPeriodSelector';
import { useFeedPlanningViewModel } from '../viewmodels/use-feed-planning-view-model';

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
    <DismissKeyboardArea className='mt-6 gap-6'>
      <View className='gap-2'>
        <AppText size='lg' weight='semiBold' className='text-neutral-textHead'>
          Planejamento alimentar
        </AppText>

        <AppText className='leading-5 text-neutral-textMuted'>
          Veja quanta ração seus animais vão precisar e se o estoque atual é
          suficiente para o período escolhido.
        </AppText>
      </View>

      <View className='gap-5 rounded-2xl border border-neutral-border bg-neutral-card p-4'>
        <Controller
          control={control}
          name='customDays'
          render={({ field, fieldState }) => (
            <FormGroup
              label='Período'
              required
              error={fieldState.error?.message}
            >
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

        <View className='h-px bg-neutral-border' />

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
              <FormGroup
                label='Grupo de animais'
                required
                error={fieldState.error?.message}
              >
                <Select
                  options={groupOptions}
                  value={field.value || null}
                  onChange={field.onChange}
                  placeholder={
                    isGroupsLoading
                      ? 'Carregando grupos...'
                      : 'Selecionar grupo'
                  }
                  emptyMessage='Nenhum grupo cadastrado.'
                  disabled={isGroupsLoading}
                />
              </FormGroup>
            )}
          />
        )}
      </View>

      {submitError && (
        <View className='rounded-xl border border-support-danger-border bg-support-danger-bg px-4 py-3'>
          <AppText size='sm' className='text-support-danger-text'>
            {submitError}
          </AppText>
        </View>
      )}

      <Button
        isLoading={isSubmitting}
        disabled={!canSubmit || isSubmitting}
        onPress={onSubmit}
      >
        Calcular planejamento
      </Button>

      <AppText
        size='sm'
        className='text-center leading-5 text-neutral-textMuted'
      >
        O cálculo considera as necessidades alimentares cadastradas e o estoque
        disponível de cada ração.
      </AppText>
    </DismissKeyboardArea>
  );
}
