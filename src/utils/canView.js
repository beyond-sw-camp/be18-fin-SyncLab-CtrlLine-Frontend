import { useUserStore } from '@/stores/useUserStore';

export function canView(allowedRoles) {
  const userStore = useUserStore();
  const userRole = userStore.userRole;

  // roles가 없으면 모두 허용
  if (!allowedRoles) return true;

  return allowedRoles.includes(userRole);
}
