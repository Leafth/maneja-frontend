import { useMutation } from "@tanstack/react-query";

import { authService } from "../services";

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
  });
}
