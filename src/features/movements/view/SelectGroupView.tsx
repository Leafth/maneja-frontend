import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { HeaderSecondary } from '@/shared/components/Header';
import { Select } from '@/shared/components/Select';

import { useSelectGroupViewModel } from '../viewmodels/use-select-group-view-model';

export default function SelectGroupView() {
  const {
    groupOptions,
    selectedGroupId,
    setSelectedGroupId,
    isLoading,
    error,
    isUnavailable,
    canSubmit,
    retry,
    goBack,
    handleSubmit,
  } = useSelectGroupViewModel();

  return (
    <View className="flex-1 bg-white">
      <HeaderSecondary title="Alocar Grupo" onBackPress={goBack} />

      <SafeAreaView edges={['bottom']} className="flex-1">
        <View className="gap-5 px-5 pt-4">
          <AppText className="text-neutral-textMuted">
            Selecione o grupo que será alocado:
          </AppText>

          {isLoading ? (
            <ActivityIndicator />
          ) : error ? (
            <View className="gap-4">
              <AppText color="error">
                Não foi possível carregar os grupos.
              </AppText>

              <Button onPress={retry}>Tentar novamente</Button>
            </View>
          ) : isUnavailable ? (
            <AppText color="muted">Terreno não encontrado.</AppText>
          ) : (
            <>
              <FormGroup label="Grupo" required>
                <Select
                  options={groupOptions}
                  value={selectedGroupId}
                  onChange={setSelectedGroupId}
                  placeholder="Selecionar grupo"
                  emptyMessage="Nenhum grupo cadastrado."
                />
              </FormGroup>

              <Button disabled={!canSubmit} onPress={handleSubmit}>
                Alocar Grupo
              </Button>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
