import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { HeaderSecondary } from '@/shared/components/Header';

import { FeedActionButton } from '../components/FeedActionButton';
import { useFeedTypeDetailsViewModel } from '../viewmodels/use-feed-type-details-view-model';

export default function FeedTypeDetailsView() {
  const { type, goBack, addEntry, addExit } = useFeedTypeDetailsViewModel();

  return (
    <View className="flex-1 bg-white">
      <HeaderSecondary title={type?.name ?? 'Tipo de ração'} onBackPress={goBack} />
      {type ? (
        <View className="flex-1 px-4 pt-5">
          <View className="rounded-2xl border border-gray-400 p-1">
            <View className="gap-1 rounded-xl bg-gray-100 p-4">
              <AppText size="sm" color="muted">Total disponível</AppText>
              <AppText>{type.availableKg}kg</AppText>
              <AppText size="sm" color="muted">Grupos consumidores: {type.consumingGroups}</AppText>
              <View className="mt-1 self-start rounded-lg bg-[#9DDDE9] px-2 py-1">
                <AppText size="xs">Cobertura: {type.coverageDays} dias</AppText>
              </View>
            </View>
          </View>
          <View className="mt-4 flex-row gap-4">
            <FeedActionButton onPress={addEntry} className="flex-1">＋  Entrada</FeedActionButton>
            <FeedActionButton onPress={addExit} secondary className="flex-1">−  Saída</FeedActionButton>
          </View>
          <AppText color="muted" className="mt-6">Histórico</AppText>
          <View className="mt-4 rounded-xl border border-gray-300 px-4 py-5">
            <AppText size="sm" color="muted" align="center">Funcionalidade em desenvolvimento</AppText>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <AppText color="muted">Tipo de ração não encontrado.</AppText>
        </View>
      )}
    </View>
  );
}
