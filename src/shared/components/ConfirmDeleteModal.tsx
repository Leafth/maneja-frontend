import {
  ActivityIndicator,
  Modal,
  Pressable,
  View,
} from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface ConfirmDeleteModalProps {
  visible: boolean;
  title: string;
  description?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  visible,
  title,
  description = 'Essa ação não pode ser revertida.',
  isDeleting = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  function handleCancel() {
    if (isDeleting) {return;}
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
          className="absolute inset-0 bg-black/40"
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancelar exclusão"
        />

        {/* Card de confirmação */}
        <View
          className="flex-1 items-center justify-center px-8"
          pointerEvents="box-none"
        >
          <View className="w-full max-w-[340px] rounded-[14px] bg-white px-4 py-8">
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
              className="mt-4"
            >
              {description}
            </AppText>

            <View className="mt-5 flex-row items-center justify-between gap-4">
              {/* Excluir */}
              <Pressable
                onPress={onConfirm}
                disabled={isDeleting}
                accessibilityRole="button"
                accessibilityLabel="Confirmar exclusão"
                accessibilityState={{ disabled: isDeleting }}
                style={({ pressed }) => ({
                  opacity: pressed || isDeleting ? 0.75 : 1,
                })}
                className="h-11 flex-1 items-center justify-center rounded-[12px] bg-[#539F79]"
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <AppText
                    size="sm"
                    color="white"
                    weight="medium"
                  >
                    Excluir
                  </AppText>
                )}
              </Pressable>

              {/* Cancelar */}
              <Pressable
                onPress={handleCancel}
                disabled={isDeleting}
                accessibilityRole="button"
                accessibilityLabel="Cancelar exclusão"
                accessibilityState={{ disabled: isDeleting }}
                style={({ pressed }) => ({
                  opacity: pressed || isDeleting ? 0.75 : 1,
                })}
                className="h-11 flex-1 items-center justify-center rounded-[12px] bg-[#FFD6D6]"
              >
                <AppText
                  size="sm"
                  weight="medium"
                  style={{ color: colors.black[700] }}
                >
                  Cancelar
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
