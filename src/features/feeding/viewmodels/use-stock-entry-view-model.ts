import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { useFeedStock } from '../hooks/use-feed-stock';
import { stockEntrySchema, type StockEntryFormData } from '../schemas/feed-stock.schema';

export function useStockEntryViewModel() {
  const router = useRouter();
  const { typeId } = useLocalSearchParams<{ typeId?: string }>();
  const types = useFeedStock((state) => state.types);
  const addEntry = useFeedStock((state) => state.addEntry);
  const { control, handleSubmit, setValue } = useForm<StockEntryFormData>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      typeId: typeof typeId === 'string' && types.some((type) => type.id === typeId) ? typeId : '',
      quantityKg: '',
      value: '',
      date: new Date().toLocaleDateString('pt-BR'),
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
      addEntry(id, Number(quantityKg.replace(',', '.')));
      router.back();
    }),
  };
}
