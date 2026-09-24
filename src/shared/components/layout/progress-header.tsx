import { Pressable, View } from "react-native";

type ProgressHeaderProps = {
  progress?: number;
  onBack?: () => void;
};

export function ProgressHeader({ progress = 0, onBack }: ProgressHeaderProps) {
  const percent = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View className="h-11 flex-row items-center px-2">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
        className="h-11 w-11 items-center justify-center"
      >
        <View className="ml-[4px] h-[10px] w-[10px] rotate-45 border-b-2 border-l-2 border-zinc-600" />
      </Pressable>

      <View className="mx-5 h-1 flex-1 overflow-hidden rounded-full bg-track">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </View>

      <View className="w-11" />
    </View>
  );
}