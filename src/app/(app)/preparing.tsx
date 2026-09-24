import { Stack } from "expo-router";

import { PreparingView } from "@/features/auth/view/preparing-view";

export default function PreparingRoute() {
  return (
    <>
      <Stack.Screen
        options={{ headerShown: false, gestureEnabled: false, animation: "fade" }}
      />
      <PreparingView />
    </>
  );
}