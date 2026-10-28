import { ArrowRight, TriangleAlert } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { HeaderSecondary } from '@/shared/components/Header';
import colors from '@/styles/colors';

import { MovementGroupSummary } from '../components/MovementGroupSummary';
import { formatAnimalCount } from '../utils/format-animal-count';
import { useConfirmMovementViewModel } from '../viewmodels/use-confirm-movement-view-model';

interface IInfoFieldProps {
  label: string;
  value: string;
}

function InfoField({ label, value }: IInfoFieldProps) {
  return (
    <View className="gap-1">
      <AppText weight="medium" className="text-neutral-textHead">
        {label}
      </AppText>

      <AppText className="text-neutral-textMuted" numberOfLines={2}>
        {value}
      </AppText>
    </View>
  );
}

export default function ConfirmMovementView() {
  const {
    group,
    destination,
    originName,
    originRestDays,
    isDestinationAvailable,
    isLoading,
    error,
    isUnavailable,
    isConfirming,
    confirmError,
    retry,
    handleConfirm,
    handleCancel,
  } = useConfirmMovementViewModel();

  return (
    <View className="flex-1 bg-white">
      <HeaderSecondary title="Movimentar Grupo" onBackPress={handleCancel} />

      <SafeAreaView edges={['bottom']} className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center gap-4 px-5">
            <AppText color="error" align="center">
              Não foi possível carregar os dados da movimentação.
            </AppText>

            <Button onPress={retry}>Tentar novamente</Button>
          </View>
        ) : isUnavailable || !group || !destination ? (
          <View className="flex-1 items-center justify-center">
            <AppText color="muted">Grupo ou terreno não encontrado.</AppText>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 32,
              gap: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <MovementGroupSummary
              title="Confirmar Movimentação"
              animalCount={group.animalCount}
              currentTerrainName={originName}
            />

            <View className="gap-4 rounded-[14px] border border-neutral-border bg-neutral-card p-4">
              <AppText weight="medium" className="text-neutral-textHead">
                Confirmar Movimentação
              </AppText>

              <View className="gap-4 rounded-[10px] bg-neutral-surface p-3">
                <InfoField label="Grupo" value={group.name} />

                <InfoField
                  label="Quantidade"
                  value={formatAnimalCount(group.animalCount)}
                />

                <View className="flex-row items-end gap-3">
                  <View className="flex-1">
                    <InfoField label="De" value={originName ?? 'Sem alocação'} />
                  </View>

                  <View className="pb-1">
                    <ArrowRight size={18} color={colors.black[700]} />
                  </View>

                  <View className="flex-1">
                    <InfoField label="Para" value={destination.name} />
                  </View>
                </View>
              </View>

              {originName && originRestDays !== null && (
                <View className="flex-row items-start gap-2 rounded-[8px] border border-support-warning-border bg-support-warning-bg px-3 py-2">
                  <TriangleAlert
                    size={16}
                    color={colors.support.warning.solid}
                  />

                  <AppText size="xs" className="flex-1 text-support-warning-text">
                    {originName} iniciará automaticamente o período de descanso
                    de {originRestDays} {originRestDays === 1 ? 'dia' : 'dias'}.
                  </AppText>
                </View>
              )}
            </View>

            {!isDestinationAvailable && (
              <AppText size="sm" color="error">
                Este terreno não está mais disponível. Escolha outro terreno.
              </AppText>
            )}

            {confirmError && (
              <AppText size="sm" color="error">
                Não foi possível confirmar a movimentação. Tente novamente.
              </AppText>
            )}

            <View className="gap-3">
              <Button
                variant="success"
                onPress={handleConfirm}
                isLoading={isConfirming}
                disabled={!isDestinationAvailable}
              >
                Confirmar Movimentação
              </Button>

              <Button
                variant="danger"
                onPress={handleCancel}
                disabled={isConfirming}
              >
                Cancelar
              </Button>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
