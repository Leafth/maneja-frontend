import { ChevronLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import colors from '@/styles/colors';

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { useResetPasswordViewModel } from '../viewmodels/use-reset-password.view-model';

export function CreateNewPassword() {
  const { control, onSubmit, goBack, isValid, isSubmitting } =
    useResetPasswordViewModel();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

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
            <ChevronLeftIcon size={20} color={colors.black[700]} />
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
              className='tracking-[-0.32px]'
            >
              Criar Nova Senha
            </AppText>

            <AppText color='muted'>
              Digite sua nova senha de acesso abaixo. Lembre-se de usar pelo
              menos 8 caracteres.
            </AppText>
          </View>

          <View className='mt-6 gap-4 px-6'>
            <Controller
              control={control}
              name='password'
              render={({ field, fieldState }) => (
                <View className='gap-1'>
                  <AppText size='sm' weight='medium'>
                    Nova Senha
                  </AppText>

                  <View className='relative'>
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder='Digite sua senha'
                      secureTextEntry={!showPassword}
                      disabled={isSubmitting}
                      error={!!fieldState.error}
                      className='pr-12'
                    />

                    <TouchableOpacity
                      className='absolute right-4 top-4'
                      onPress={() => setShowPassword((previous) => !previous)}
                      accessibilityLabel={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      {showPassword ? (
                        <EyeOffIcon size={20} color={colors.gray[700]} />
                      ) : (
                        <EyeIcon size={20} color={colors.gray[700]} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {fieldState.error && (
                    <AppText size='xs' color='error'>
                      {fieldState.error.message}
                    </AppText>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name='passwordConfirmation'
              render={({ field, fieldState }) => (
                <View className='gap-1'>
                  <AppText size='sm' weight='medium'>
                    Confirmar Nova Senha
                  </AppText>

                  <View className='relative'>
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder='Digite sua senha novamente'
                      secureTextEntry={!showPasswordConfirmation}
                      disabled={isSubmitting}
                      error={!!fieldState.error}
                      className='pr-12'
                    />

                    <TouchableOpacity
                      className='absolute right-4 top-4'
                      onPress={() =>
                        setShowPasswordConfirmation((previous) => !previous)
                      }
                      accessibilityLabel={
                        showPasswordConfirmation
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }
                    >
                      {showPasswordConfirmation ? (
                        <EyeOffIcon size={20} color={colors.gray[700]} />
                      ) : (
                        <EyeIcon size={20} color={colors.gray[700]} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {fieldState.error && (
                    <AppText size='xs' color='error'>
                      {fieldState.error.message}
                    </AppText>
                  )}
                </View>
              )}
            />
          </View>

          <View className='flex-1 justify-end px-6 pb-4 pt-8'>
            <Button
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
              onPress={onSubmit}
            >
              Confirmar
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
