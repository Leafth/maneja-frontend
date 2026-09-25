import { useMutation } from '@tanstack/react-query';

import { authService } from '../services';

export function useResetPassword() {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
}
