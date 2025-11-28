// 상세 조회에서 업데이트 함. (담당자와 사용여부만!! 변경 가능.)

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
      toast.success('설비 정보를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['equipment', equipmentCode] });
      queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
      router.push('/base-management/equipments');
    },
    onError: error => {
      toast.error(error.message);
    },
  });
}
