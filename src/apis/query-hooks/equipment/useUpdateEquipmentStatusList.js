import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { updateEquipmentStatusList } from '@/apis/query-functions/equipment';

export default function useUpdateEquipmentStatusList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateEquipmentStatusList(params),
    onSuccess: () => {
      toast.success('설비 사용 여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
    },
    onError: error => {
      toast.error(error.response.data.message);
    },
  });
}
