import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  items: ActionMenuItem[];
  topOffset?: number;
}

export function ActionMenu({
  visible,
  onClose,
  items,
  topOffset = 56,
}: ActionMenuProps) {
  const { top } = useSafeAreaInsets();

  const [isClosing, setIsClosing] = useState(false);
  const closingRef = useRef(false);
  const pendingAction = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      pendingAction.current = null;
    }
  }, [visible]);

  function handleClose() {
    if (closingRef.current) {return;}

    closingRef.current = true;
    setIsClosing(true);
    pendingAction.current = null;
    onClose();
  }

  function handleItemPress(item: ActionMenuItem) {
    if (closingRef.current) {return;}

    closingRef.current = true;
    setIsClosing(true);

    pendingAction.current = item.onPress;

    onClose();
  }

  function handleDismiss() {
    setIsClosing(false);
    closingRef.current = false;

    const action = pendingAction.current;
    pendingAction.current = null;

    action?.();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
      onDismiss={handleDismiss}
    >
      <Pressable
        className="flex-1"
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar menu de ações"
      >
        <View
          className="absolute right-4 w-[180px] overflow-hidden rounded-[14px] bg-white py-1 shadow-lg"
          style={{
            top: top + topOffset,
            elevation: 8,
          }}
        >
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.label}
                onPress={() => handleItemPress(item)}
                disabled={isClosing}
                android_ripple={{
                  color: colors.gray[400],
                }}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{
                  disabled: isClosing,
                }}
                accessibilityHint={
                  item.destructive
                    ? 'Abre uma confirmação de exclusão'
                    : undefined
                }
                style={({ pressed }) => ({
                  backgroundColor: pressed
                    ? colors.gray[200]
                    : colors.white,
                })}
              >
                <View className="min-h-12 flex-row items-center gap-3 px-4 py-3">
                  {Icon && (
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      color={
                        item.destructive
                          ? colors.support.red
                          : colors.black[700]
                      }
                    />
                  )}

                  <AppText
                    size="sm"
                    color={item.destructive ? 'error' : 'default'}
                    className="flex-shrink"
                  >
                    {item.label}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}
