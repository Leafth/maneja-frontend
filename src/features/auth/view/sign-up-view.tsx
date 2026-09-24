import { View } from "react-native";

import { useSignUpViewModel } from "@/features/auth/viewmodels/use-sign-up.view-model";
import { FormInput } from "@/shared/components/form/form-input";
import { ProgressHeader } from "@/shared/components/layout/progress-header";
import { Screen } from "@/shared/components/layout/screen";
import { Button } from "@/shared/components/button";
import { Text } from "@/shared/components/text";

export function SignUpView() {
  const { control, setFocus, onSubmit, goBack, isValid, isSubmitting } =
    useSignUpViewModel();

  return (
    <Screen scroll header={<ProgressHeader onBack={goBack} />}>
      <View className="items-center gap-5 pb-[76px] pt-7">
        <Text variant="title">Crie sua conta</Text>
        <Text variant="subtitle">Para poder visualizar seu progresso</Text>
      </View>

      <View className="gap-7">
        <FormInput
          control={control}
          name="name"
          label="Nome"
          placeholder="João Silva"
          autoCapitalize="words"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => setFocus("email")}
        />
        <FormInput
          control={control}
          name="email"
          label="E-mail"
          placeholder="joaosilva@gmail.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => setFocus("password")}
        />
        <FormInput
          control={control}
          name="password"
          label="Senha"
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => setFocus("passwordConfirmation")}
        />
        <FormInput
          control={control}
          name="passwordConfirmation"
          label="Confirmar Senha"
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </View>

      <Button
        title="Criar conta"
        disabled={!isValid}
        loading={isSubmitting}
        onPress={onSubmit}
        className="mt-10"
      />
    </Screen>
  );
}
