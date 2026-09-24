import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from 'lucide-react-native';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';
import colors from '@/styles/colors';

import { signUpSchema, type SignUpFormData } from '../schemas/sign-up.schema';

export function SignUp() {
  const router = useRouter();

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit(data => {
    console.log(data);
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
          >
            <ChevronLeftIcon size={20} color={colors.black[700]} />
          </Button>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-grow"
        >
          <View className="gap-2 px-6">
            <AppText
              size="3xl"
              weight="semiBold"
              align="center"
              className="tracking-[-0.32px]"
            >
              Crie sua conta
            </AppText>
            <AppText color="muted" align="center">
              Para poder visualizar seu progresso
            </AppText>
          </View>

          <View className="mt-8 gap-6 px-6">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormGroup label="Nome" error={fieldState.error?.message}>
                  <Input
                    autoFocus
                    placeholder="João Silva"
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="name"
                    returnKeyType="next"
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                  />
                </FormGroup>
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormGroup label="E-mail" error={fieldState.error?.message}>
                  <Input
                    ref={emailInputRef}
                    placeholder="joaosilva@gmail.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                  />
                </FormGroup>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormGroup label="Senha" error={fieldState.error?.message}>
                  <Input
                    ref={passwordInputRef}
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                  />
                </FormGroup>
              )}
            />

            <Controller
              control={form.control}
              name="passwordConfirmation"
              render={({ field, fieldState }) => (
                <FormGroup label="Confirmar senha" error={fieldState.error?.message}>
                  <Input
                    ref={confirmPasswordInputRef}
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                  />
                </FormGroup>
              )}
            />
          </View>

          <View className="flex-1 justify-end px-6 pb-4 pt-8">
            <Button isLoading={isSubmitting} onPress={handleSubmit}>
              Criar conta
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
