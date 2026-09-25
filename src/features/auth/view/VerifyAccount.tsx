import { ChevronLeftIcon } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
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
import { OtpInput } from '@/shared/components/OtpInput';
import colors from '@/styles/colors';

import { useVerifyPasswordResetCodeViewModel } from '../viewmodels/use-verify-code.view-model';

export function VerifyAccount() {
  const {
    control,
    maskedEmail,
    onSubmit,
    resendCode,
    goBack,
    clearCodeError,
    isValid,
    isSubmitting,
    isResending,
  } = useVerifyPasswordResetCodeViewModel();

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
              Verificação de Conta
            </AppText>

            <AppText color='muted'>
              Digite o código de segurança de 6 dígitos que enviamos para o
              e-mail: {maskedEmail}
            </AppText>
          </View>

          <View className='mt-8 gap-4 px-6'>
            <Controller
              control={control}
              name='code'
              render={({ field, fieldState }) => (
                <View className='gap-2'>
                  <OtpInput
                    autoFocus
                    value={field.value}
                    onChange={(value) => {
                      clearCodeError();
                      field.onChange(value);
                    }}
                    onComplete={() => onSubmit()}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                  />

                  {fieldState.error && (
                    <AppText size='xs' color='error' align='center'>
                      {fieldState.error.message}
                    </AppText>
                  )}
                </View>
              )}
            />

            <View className='flex-row justify-center gap-1'>
              <AppText color='muted'>Não recebeu o código?</AppText>
              <TouchableOpacity onPress={resendCode} disabled={isResending}>
                <AppText
                  color='primary'
                  weight='semiBold'
                  className='underline'
                >
                  {isResending ? 'Reenviando...' : 'Reenviar'}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          <View className='flex-1 justify-end px-6 pb-4 pt-8'>
            <Button
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
              onPress={onSubmit}
            >
              Verificar
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
