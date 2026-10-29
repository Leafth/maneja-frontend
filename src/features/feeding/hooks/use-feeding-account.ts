import { useMe } from '@/features/auth/hooks/use-me';

export function useFeedingAccount() {
  const { data: user, isLoading, isError } = useMe();

  return {
    accountId: user?.id,
    isLoading,
    isError,
  };
}
