import greetingsBg from '@/assets/images/greetings-bg/image.png';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { Logo } from '@/shared/components/Logo';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignInBottomSheet } from '../components/SignInBottomSheet';
import type { ISignInBottomSheet } from '../components/SignInBottomSheet/ISignInBottomSheet';

export function Greetings() {
  const signInBottomSheetRef = useRef<ISignInBottomSheet>(null);
  const router = useRouter();

  return (
    <>
      <ImageBackground
        source={greetingsBg}
        resizeMode="cover"
        className="flex-1"
      >
        <SafeAreaView className="flex-1 items-center justify-between py-4">
          <Logo width={100} height={32} />

          <View className="w-full items-center">
            <AppText
              color="white"
              weight="semiBold"
              size="3xl"
              align="center"
              className="max-w-[311px] leading-[34px] tracking-[-0.32px]"
            >
              O manejo da sua propriedade sem complicação
            </AppText>

            <View className="mt-6 w-full p-5">
              <Button onPress={() => router.push('/sign-up')}>
                Criar conta
              </Button>

              <View className="mt-4 flex-row justify-center gap-1 py-[14px]">
                <AppText color="white">Já tem conta?</AppText>
                <TouchableOpacity
                  onPress={() => signInBottomSheetRef.current?.open()}
                >
                  <AppText color="lime" weight="medium">
                    Acessar conta
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <SignInBottomSheet ref={signInBottomSheetRef} />
    </>
  );
}
