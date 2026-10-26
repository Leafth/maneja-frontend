import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { useFeedStock } from '../hooks/use-feed-stock';
import { stockExitSchema, type StockExitFormData } from '../schemas/feed-stock.schema';

export function useStockExitViewModel() {
  const router = useRouter();
  const { typeId } = useLocalSearchParams<{ typeId?: string }>();
  const types = useFeedStock((state) => state.types);
  const addExit = useFeedStock((state) => state.addExit);
  const { control, handleSubmit, setError, setValue } = useForm<StockExitFormData>({
    resolver: zodResolver(stockExitSchema),
    defaultValues: {
      typeId: typeof typeId === 'string' && types.some((type) => type.id === typeId) ? typeId : '',
      quantityKg: '',
      reason: '',
    },
  });
  const selectedTypeId = useWatch({ control, name: 'typeId' });

  return {
    control,
    types,
    selectedTypeId,
    selectType: (id: string) => setValue('typeId', id, { shouldValidate: true }),
    goBack: () => router.back(),
    onSubmit: handleSubmit(({ typeId: id, quantityKg }) => {
      const amount = Number(quantityKg.replace(',', '.'));
      const type = types.find((item) => item.id === id);
      if (!type || amount > type.availableKg) {
        setError('quantityKg', { message: 'Quantidade maior que o estoque disponível' });
        return;
      }
      addExit(id, amount);
      router.back();
    }),
  };
}
