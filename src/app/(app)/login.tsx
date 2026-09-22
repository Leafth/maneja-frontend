import { Stack } from "expo-router";

import { LoginView } from "@/features/auth/view/login-view";

export default function LoginRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoginView />
    </>
  );
}