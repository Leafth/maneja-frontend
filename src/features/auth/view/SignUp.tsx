import {
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';
import colors from '@/styles/colors';

import { useSignUpViewModel } from '../viewmodels/use-sign-up.view-model';

export function SignUp() {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [
    showPasswordConfirmation,
    setShowPasswordConfirmation,
  ] = useState(false);

  const {
    control,
    onSubmit,
    goBack,
    isValid,
    isSubmitting,
    isError,
  } = useSignUpViewModel();

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-white'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className='flex-1'>
        <View className='flex-row items-center px-2 py-1'>
          <Button
            variant='ghost'
            size='icon'
            accessibilityLabel='Voltar'
            onPress={goBack}
          >
            <ChevronLeftIcon
              size={20}
              color={colors.black[700]}
            />
          </Button>
        </View>

        <ScrollView
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          contentContainerClassName='flex-grow'
        >
          <View className='gap-2 px-6'>
            <AppText
              size='3xl'
              weight='semiBold'
              align='center'
              className='tracking-[-0.32px]'
            >
              Crie sua conta
            </AppText>

            <AppText
              color='muted'
              align='center'
            >
              Para poder visualizar seu progresso
            </AppText>
          </View>

          <View className='mt-8 gap-6 px-6'>
            <Controller
              control={control}
              name='name'
              render={({ field, fieldState }) => (
                <FormGroup
                  label='Nome'
                  error={fieldState.error?.message}
                >
                  <Input
                    autoFocus
                    placeholder='João Silva'
                    autoCapitalize='words'
                    autoCorrect={false}
                    autoComplete='name'
                    returnKeyType='next'
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                    onSubmitEditing={() =>
                      emailInputRef.current?.focus()
                    }
                  />
                </FormGroup>
              )}
            />

            <Controller
              control={control}
              name='email'
              render={({ field, fieldState }) => (
                <FormGroup
                  label='E-mail'
                  error={fieldState.error?.message}
                >
                  <Input
                    ref={emailInputRef}
                    placeholder='joaosilva@gmail.com'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoComplete='email'
                    returnKeyType='next'
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                    onSubmitEditing={() =>
                      passwordInputRef.current?.focus()
                    }
                  />
                </FormGroup>
              )}
            />

            <Controller
              control={control}
              name='password'
              render={({ field, fieldState }) => (
                <FormGroup
                  label='Senha'
                  error={fieldState.error?.message}
                >
                  <View className='relative'>
                    <Input
                      ref={passwordInputRef}
                      placeholder='Mínimo 8 caracteres'
                      secureTextEntry={!showPassword}
                      autoCapitalize='none'
                      autoCorrect={false}
                      autoComplete='new-password'
                      returnKeyType='next'
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      className='pr-12'
                      onSubmitEditing={() =>
                        confirmPasswordInputRef.current?.focus()
                      }
                    />

                    <TouchableOpacity
                      className='absolute right-4 top-4'
                      onPress={() =>
                        setShowPassword(
                          (previous) => !previous,
                        )
                      }
                      accessibilityRole='button'
                      accessibilityLabel={
                        showPassword
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }
                    >
                      {showPassword ? (
                        <EyeOffIcon
                          size={20}
                          color={colors.black[700]}
                        />
                      ) : (
                        <EyeIcon
                          size={20}
                          color={colors.black[700]}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </FormGroup>
              )}
            />

            <Controller
              control={control}
              name='passwordConfirmation'
              render={({ field, fieldState }) => (
                <FormGroup
                  label='Confirmar senha'
                  error={fieldState.error?.message}
                >
                  <View className='relative'>
                    <Input
                      ref={confirmPasswordInputRef}
                      placeholder='Mínimo 8 caracteres'
                      secureTextEntry={
                        !showPasswordConfirmation
                      }
                      autoCapitalize='none'
                      autoCorrect={false}
                      autoComplete='new-password'
                      returnKeyType='done'
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      className='pr-12'
                      onSubmitEditing={onSubmit}
                    />

                    <TouchableOpacity
                      className='absolute right-4 top-4'
                      onPress={() =>
                        setShowPasswordConfirmation(
                          (previous) => !previous,
                        )
                      }
                      accessibilityRole='button'
                      accessibilityLabel={
                        showPasswordConfirmation
                          ? 'Ocultar confirmação de senha'
                          : 'Mostrar confirmação de senha'
                      }
                    >
                      {showPasswordConfirmation ? (
                        <EyeOffIcon
                          size={20}
                          color={colors.black[700]}
                        />
                      ) : (
                        <EyeIcon
                          size={20}
                          color={colors.black[700]}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </FormGroup>
              )}
            />

            {isError && (
              <AppText
                align='center'
                className='text-red-500'
              >
                Não foi possível criar sua conta.
              </AppText>
            )}
          </View>

          <View className='flex-1 justify-end px-6 pb-4 pt-8'>
            <Button
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
              onPress={onSubmit}
            >
              Criar conta
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
