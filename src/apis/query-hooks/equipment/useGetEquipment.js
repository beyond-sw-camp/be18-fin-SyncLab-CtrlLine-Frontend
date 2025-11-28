import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getEquipment } from '@/apis/query-functions/equipment';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetEquipment(equipmentCode) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['equipment', equipmentCode],
    queryFn: () => getEquipment(equipmentCode),
    enabled: computed(() => authStore.isLoggedIn),
  });
}
