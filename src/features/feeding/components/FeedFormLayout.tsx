import type { ComponentRef, ReactNode, Ref } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderSecondary } from '@/shared/components/Header';

interface Props {
  title: string;
  onBack: () => void;
  children: ReactNode;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
}

export function FeedFormLayout({ title, onBack, children, scrollRef }: Props) {
  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <HeaderSecondary title={title} onBackPress={onBack} />
        <SafeAreaView edges={['bottom']} className="flex-1">
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 16 }}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
