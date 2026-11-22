import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { HeaderSecondary } from '@/shared/components/Header';

import { MovementGroupSummary } from '../components/MovementGroupSummary';
import { MovementTerrainOption } from '../components/MovementTerrainOption';
import { useSelectTerrainViewModel } from '../viewmodels/use-select-terrain-view-model';

export default function SelectTerrainView() {
  const {
    group,
    currentTerrainName,
    terrainOptions,
    isLoading,
    error,
    isUnavailable,
    retry,
    forceSelectRemainingDays,
    isForceSelectModalOpen,
    goBack,
    handleSelectTerrain,
    handleForceSelect,
    handleCancelForceSelect,
    handleConfirmForceSelect,
  } = useSelectTerrainViewModel();

  return (
    <View className="flex-1 bg-white">
      <HeaderSecondary title="Movimentar Grupo" onBackPress={goBack} />

      <SafeAreaView edges={['bottom']} className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center gap-4 px-5">
            <AppText color="error" align="center">
              Não foi possível carregar os terrenos.
            </AppText>

            <Button onPress={retry}>Tentar novamente</Button>
          </View>
        ) : isUnavailable || !group ? (
          <View className="flex-1 items-center justify-center">
            <AppText color="muted">Grupo de animais não encontrado.</AppText>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 32,
              gap: 12,
            }}
            showsVerticalScrollIndicator={false}
          >
            <MovementGroupSummary
              title={group.name}
              animalCount={group.animalCount}
              currentTerrainName={currentTerrainName}
            />

            <AppText className="mt-3 text-neutral-textMuted">
              Selecione o terreno de destino:
            </AppText>

            {terrainOptions.length === 0 ? (
              <AppText size="sm" color="muted">
                Nenhum terreno cadastrado.
              </AppText>
            ) : (
              terrainOptions.map(({ terrain, state }) => (
                <MovementTerrainOption
                  key={terrain.localId}
                  terrain={terrain}
                  state={state}
                  onSelect={() => handleSelectTerrain(terrain.localId)}
                  onForceSelect={() => handleForceSelect(terrain.localId)}
                />
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      <ConfirmModal
        visible={isForceSelectModalOpen}
        title="Forçar seleção?"
        description={`Este terreno ainda precisa de ${forceSelectRemainingDays ?? 0} ${forceSelectRemainingDays === 1 ? 'dia' : 'dias'} de descanso. Ao forçar seleção irá retirar antes disso.`}
        confirmLabel="Forçar seleção"
        onConfirm={handleConfirmForceSelect}
        onCancel={handleCancelForceSelect}
      />
    </View>
  );
}
