// 설비 목록에서 설비 사용여부(isActive)를 업데이트하기 위한 훅

// useMutation 서버 데이터 수정 작업을 위한 훅. (설비 상태 변경할 때 사용)
// useQueryClient 캐시 관리 훅
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateEquipment } from '@/apis/query-functions/equipment';

export default function useUpdateEquipment(equipmentCode) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: params => updateEquipment(equipmentCode, params),
    onSuccess: () => {
      toast.success('설비 사용 여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['equipment', equipmentCode] });
      queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
      router.push('/base-management/equipments');
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
