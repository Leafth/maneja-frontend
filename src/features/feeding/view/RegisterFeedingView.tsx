import { Clock3 } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import colors from '@/styles/colors';

import { FeedFormLayout } from '../components/FeedFormLayout';
import { formatDateInput, formatTimeInput } from '../utils/feed-date';
import { useRegisterFeedingViewModel } from '../viewmodels/use-register-feeding-view-model';

export default function RegisterFeedingView() {
  const vm = useRegisterFeedingViewModel();

  return (
    <FeedFormLayout title='Registrar Alimentação' onBack={vm.goBack}>
      {vm.isLoading ? (
        <ActivityIndicator />
      ) : vm.hasError ? (
        <View className='gap-4'>
          <AppText color='error'>Não foi possível carregar os grupos e as rações.</AppText>
          <Button onPress={vm.retry}>Tentar novamente</Button>
        </View>
      ) : (
        <>
          <View style={{ zIndex: 3 }}>
            <Controller control={vm.control} name='groupLocalId' render={({ field, fieldState }) => (
              <FormGroup label='Grupo' required error={fieldState.error?.message}>
                <Select options={vm.groupOptions} value={field.value} onChange={field.onChange} placeholder='Selecionar grupo' emptyMessage='Nenhum grupo disponível.' disabled={vm.isSubmitting} />
              </FormGroup>
            )} />
          </View>
          <View style={{ zIndex: 2 }}>
            <Controller control={vm.control} name='feedLocalId' render={({ field, fieldState }) => (
              <FormGroup label='Tipo de ração' required error={fieldState.error?.message}>
                <Select options={vm.feedOptions} value={field.value} onChange={field.onChange} placeholder='Selecionar ração' emptyMessage='Nenhum tipo de ração cadastrado.' disabled={vm.isSubmitting} />
              </FormGroup>
            )} />
          </View>
          <Controller control={vm.control} name='quantityKg' render={({ field, fieldState }) => (
            <FormGroup label='Quantidade' required error={fieldState.error?.message}>
              <Input ref={field.ref} placeholder='80' suffix='kg' keyboardType='decimal-pad' value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} disabled={vm.isSubmitting} />
            </FormGroup>
          )} />
          <View className='flex-row items-start gap-5'>
            <View className='flex-1'>
              <Controller control={vm.control} name='date' render={({ field, fieldState }) => (
                <FormGroup label='Data' required error={fieldState.error?.message}>
                  <Input ref={field.ref} accessibilityLabel='Data da alimentação' placeholder='DD/MM/AAAA' keyboardType='number-pad' maxLength={10} formatter={formatDateInput} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} disabled={vm.isSubmitting} />
                </FormGroup>
              )} />
            </View>
            <View className='flex-1'>
              <Controller control={vm.control} name='time' render={({ field, fieldState }) => (
                <FormGroup label='Horário' error={fieldState.error?.message}>
                  <View className={`flex-row items-center rounded-[10px] border pr-3 ${fieldState.error ? 'border-support-red' : 'border-gray-400'}`}>
                    <Input ref={field.ref} accessibilityLabel='Horário da alimentação' className='flex-1 border-0' placeholder='07:30' keyboardType='number-pad' maxLength={5} formatter={formatTimeInput} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} disabled={vm.isSubmitting} />
                    <Clock3 size={18} color={colors.black[700]} />
                  </View>
                </FormGroup>
              )} />
            </View>
          </View>
          {vm.error && <AppText size='sm' color='error'>{vm.error}</AppText>}
          <Button onPress={() => { void vm.onSubmit(); }} isLoading={vm.isSubmitting} disabled={!vm.canSubmit}>Registrar</Button>
        </>
      )}
    </FeedFormLayout>
  );
}
