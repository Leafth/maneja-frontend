import { Controller } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { HeaderPrimary } from '@/shared/components/Header';
import { Input } from '@/shared/components/Input';

import { useCreateTerrainViewModel } from '../viewmodels/use-create-terrain-view-model';

export default function CreateTerrainView() {
  const {
    control,
    onSubmit,
    isValid,
    isSubmitting,
    isOnline,
    error,
  } = useCreateTerrainViewModel();

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <HeaderPrimary isOnline={isOnline} />

        <SafeAreaView edges={[]} className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 32,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Cabeçalho */}
            <AppText
              size="sm"
              weight="medium"
              className="uppercase"
            >
              NOVO TERRENO
            </AppText>

            <AppText
              size="sm"
              color="muted"
              className="mt-3"
            >
              Cadastre um novo terreno
            </AppText>

            {/* Formulário */}
            <View className="mt-5 gap-4">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormGroup
                    label="Nome do terreno"
                    required
                    error={fieldState.error?.message}
                  >
                    <Input
                      placeholder="Pasto Norte"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      autoCapitalize="sentences"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </FormGroup>
                )}
              />

              <Controller
                control={control}
                name="restDays"
                render={({ field, fieldState }) => (
                  <FormGroup
                    label="Período de descanso (dias)"
                    required
                    error={fieldState.error?.message}
                  >
                    <Input
                      placeholder="30"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      keyboardType="number-pad"
                      returnKeyType="done"
                      onSubmitEditing={onSubmit}
                    />
                  </FormGroup>
                )}
              />

              {error && (
                <AppText size="sm" color="error">
                  Não foi possível cadastrar o terreno.
                  Tente novamente.
                </AppText>
              )}

              <Button
                onPress={onSubmit}
                isLoading={isSubmitting}
                disabled={!isValid || isSubmitting}
                className="mt-1"
              >
                Cadastrar
              </Button>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
