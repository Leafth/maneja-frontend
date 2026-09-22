import { KeyboardAvoidingView, View } from "react-native";

import { LoginHero } from "@/features/auth/components/login-hero";
import { useLoginViewModel } from "@/features/auth/viewmodels/use-login-viewmodel";
import { FormInput } from "@/shared/components/form/form-input";
import { Sheet } from "@/shared/components/layout/sheet";
import { Button } from "@/shared/components/button";
import { Text } from "@/shared/components/text";

export function LoginView() {
  const { control, setFocus, onSubmit, isValid, isSubmitting } =
    useLoginViewModel();

  return (
    <View className="flex-1 bg-zinc-300">
      <LoginHero />

      <KeyboardAvoidingView className="flex-1 justify-end" behavior="padding">
        <Sheet>
          <Text variant="title">Entre em sua conta</Text>

          <View className="mt-7 gap-9">
            <FormInput
              control={control}
              name="email"
              label="E-mail"
              autoCapitalize="none"
              autoComplete="email"
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
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          </View>

          <Button
            title="Entrar"
            size="md"
            disabled={!isValid}
            loading={isSubmitting}
            onPress={onSubmit}
            className="mt-9"
          />
        </Sheet>
      </KeyboardAvoidingView>
    </View>
  );
}