import { ChevronLeftIcon } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';
import colors from '@/styles/colors';

import { useForgotPasswordViewModel } from '../viewmodels/use-forgot-password.view-model';

export function ForgotPassword() {
  const { control, onSubmit, goBack, isValid, isSubmitting } =
    useForgotPasswordViewModel();

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
              Recuperar Acesso
            </AppText>

            <AppText color='muted'>
              Informe o e-mail da sua conta. Enviaremos um código para você
              criar uma nova senha.
            </AppText>
          </View>

          <View className='mt-8 gap-6 px-6'>
            <Controller
              control={control}
              name='email'
              render={({ field, fieldState }) => (
                <FormGroup label='E-mail' error={fieldState.error?.message}>
                  <Input
                    autoFocus
                    placeholder='joaosilva@gmail.com'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoComplete='email'
                    returnKeyType='send'
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                    onSubmitEditing={onSubmit}
                  />
                </FormGroup>
              )}
            />
          </View>

          <View className='flex-1 justify-end px-6 pb-4 pt-8'>
            <Button
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
              onPress={onSubmit}
            >
              Enviar código
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
