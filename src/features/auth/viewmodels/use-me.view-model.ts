import { useMe } from '../hooks';
import { useAuthStore } from '../stores';

export function useMeViewModel() {
  const user = useAuthStore((state) => state.user);
  const authenticate = useAuthStore((state) => state.authenticate);

  const meQuery = useMe(false);

  const loadMe = async () => {
    const result = await meQuery.refetch({
      throwOnError: true,
    });

    if (!result.data) {
      throw new Error('Não foi possível obter os dados do usuário.');
    }

    authenticate(result.data);

    return result.data;
  };

  return {
    user,

    loadMe,

    isLoading: meQuery.isFetching,
    isError: meQuery.isError,
    error: meQuery.error,
  };
}
