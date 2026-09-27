import { useMutation } from '@tanstack/react-query';

import { authService } from '../services';

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
  });
}
