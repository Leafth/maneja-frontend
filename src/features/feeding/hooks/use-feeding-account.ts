import { useMe } from '@/features/auth/hooks/use-me';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export function useFeedingAccount() {
  const currentUser = useAuthStore(state => state.user);
  const { isLoading, isError } = useMe(!currentUser);

  return {
    accountId: currentUser?.id,
    isLoading: !currentUser && isLoading,
    isError: !currentUser && isError,
  };
}
