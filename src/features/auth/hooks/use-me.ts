import { useQuery } from '@tanstack/react-query';

import { authService } from '../services';

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled,
    retry: false,
  });
}
