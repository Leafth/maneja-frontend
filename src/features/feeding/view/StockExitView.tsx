import { CalendarDays } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';
import colors from '@/styles/colors';

import { FeedActionButton } from '../components/FeedActionButton';
import { FeedFormLayout } from '../components/FeedFormLayout';
import { FeedTypePicker } from '../components/FeedTypePicker';
import { useStockExitViewModel } from '../viewmodels/use-stock-exit-view-model';

export default function StockExitView() {
  const { control, types, selectedTypeId, selectType, onSubmit, goBack } =
    useStockExitViewModel();

  return (
    <FeedFormLayout title='Saída de Estoque' onBack={goBack}>
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
            <View className='flex-row items-center rounded-[10px] border border-gray-400 pr-3'>
              <Input
                className='flex-1 border-0'
                placeholder='DD/MM/AAAA'
                keyboardType='numbers-and-punctuation'
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />

              <CalendarDays size={18} color={colors.black[700]} />
            </View>
          </FormGroup>
        )}
      />

      <FeedActionButton onPress={onSubmit}>Registrar Saída</FeedActionButton>
    </FeedFormLayout>
  );
}
