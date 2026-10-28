import {
  ActivityIndicator,
  Modal,
  Pressable,
  View,
} from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  function handleCancel() {
    if (isConfirming) {return;}
    onCancel();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleCancel}
    >
      <View className="flex-1">
        {/* Overlay sobre toda a tela */}
        <Pressable
          className="absolute inset-0 bg-black-900/40"
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        />

        {/* Card de confirmação */}
        <View
          className="flex-1 items-center justify-center px-8"
          pointerEvents="box-none"
        >
          <View className="w-full max-w-[340px] rounded-[14px] bg-white px-4 py-5">
            <AppText
              size="base"
              weight="medium"
              align="center"
            >
              {title}
            </AppText>

            <AppText
              size="sm"
              color="muted"
              align="center"
              className="mt-3"
            >
              {description}
            </AppText>

            <View className="mt-5 flex-row items-center justify-between gap-4">
              <Pressable
                onPress={handleCancel}
                disabled={isConfirming}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}
                accessibilityState={{ disabled: isConfirming }}
                style={({ pressed }) => ({
                  opacity: pressed || isConfirming ? 0.75 : 1,
                })}
                className="h-11 flex-1 items-center justify-center rounded-[12px] bg-gray-300"
              >
                <AppText size="sm" weight="medium">
                  {cancelLabel}
                </AppText>
              </Pressable>

              <Pressable
                onPress={onConfirm}
                disabled={isConfirming}
                accessibilityRole="button"
                accessibilityLabel={confirmLabel}
                accessibilityState={{ disabled: isConfirming, busy: isConfirming }}
                style={({ pressed }) => ({
                  opacity: pressed || isConfirming ? 0.75 : 1,
                })}
                className="h-11 flex-1 items-center justify-center rounded-[12px] bg-support-warning-solid"
              >
                {isConfirming ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <AppText size="sm" color="white" weight="medium">
                    {confirmLabel}
                  </AppText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
