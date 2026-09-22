import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  signUpSchema,
  type SignUpFormData,
} from "@/features/auth/schemas/sign-up.schema";

export function useSignUpViewModel() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setFocus,
    trigger,
    formState: { isValid, isSubmitting, touchedFields },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password" });
  useEffect(() => {
    if (touchedFields.confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, touchedFields.confirmPassword, trigger]);

  const onSubmit = handleSubmit(async (data) => {
    // TODO: chamar o serviço de cadastro
    console.log("sign up", data.email);

    router.replace("/preparing");
  });

  const goBack = () => {
    if (router.canGoBack()) router.back();
  };

  return { control, setFocus, onSubmit, goBack, isValid, isSubmitting };
}
