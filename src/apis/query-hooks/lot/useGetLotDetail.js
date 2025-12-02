import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { getLotDetail } from '@/apis/query-functions/lot';
import { useAuthStore } from '@/stores/useAuthStore';

export default function useGetLotDetail(lotId) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['lotDetail', lotId],
    queryFn: () => getLotDetail(lotId.value ?? lotId),
    enabled: computed(() => Boolean(lotId?.value ?? lotId) && authStore.isLoggedIn),
    refetchOnWindowFocus: false,
  });
}
