import { useMutation } from '@tanstack/react-query';

import { authService } from '../services';

export function useVerifyPasswordResetCode() {
  return useMutation({
    mutationFn: authService.verifyPasswordResetCode,
  });
}
