import { useLogoutViewModel } from '@/features/auth/viewmodels/use-logout.view-model';
import { useMeViewModel } from '@/features/auth/viewmodels/use-me.view-model';

export function useHomeViewModel() {
  const { logout, isLoggingOut } = useLogoutViewModel();
  const { user } = useMeViewModel();

  return {
    userName: user?.name ?? '',
    logout,
    isLoggingOut,
  };
}
