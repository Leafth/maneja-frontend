import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth/schemas/login.schema";

export function useLoginViewModel() {
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isValid, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    // TODO: chamar o serviço de login 
    console.log("login", data.email);
  });

  return { control, setFocus, onSubmit, isValid, isSubmitting };
}