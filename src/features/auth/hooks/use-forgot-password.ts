import { useMutation } from '@tanstack/react-query';

import { authService } from '../services';

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
}
