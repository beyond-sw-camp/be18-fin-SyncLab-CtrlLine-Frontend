// 설비 목록에서 설비 사용여부(isActive)를 업데이트하기 위한 훅

// useMutation 서버 데이터 수정 작업을 위한 훅. (설비 상태 변경할 때 사용)
// useQueryClient 캐시 관리 훅
import { useMutation, useQueryClient } from '@tanstack/vue-query';
// 오류나 성공 메시지를 사용자에게 보여주는 역할임.
import { toast } from 'vue-sonner';

import { updateEquipment } from '@/apis/query-functions/equipment';

// 이건 뭐하는 거지. 쿼리로 설비 목록 불러오나?
export default function useUpdateEquipmentList() {
  const queryClient = useQueryClient();

  // 여러 설비의 사용여부 상태를 한 번에, 서버에 업데이트.
  // updateEquipments는 [{ equipmentCode, isActive }, ...] 형태의 배열을 받음.
  const updateEquipmentList = async updatedEquipments => {
    const results = [];
    // for문 돌면서 각각 업데이트 요청 보냄.
    for (const item of updatedEquipments) {
      const res = await updateEquipment(item.equipmentCode, { isActive: item.isActive });
      results.push(res);
    }
    // 설비 목록 캐시를 무효화하여 다시 데이터를 불러옴. => 업데이트 반영.
    queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
    return results;
  };

  // 단일 설비의 isActive를 토글하는 뮤테이션(옵티미스틱 업데이트 -> 서버 응답 기다리지 않고, UI를 즉시 업데이트 함.)
  /**
   * @param {{ equipmentCode: string, isActive: boolean }} vars
   * @returns {Promise<any>}
   */
  const mutationFn = vars => updateEquipment(vars.equipmentCode, { isActive: vars.isActive });

  const toggleEquipmentActiveMutation = useMutation({
    mutationFn,
    onMutate: async ({ equipmentCode, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['equipment', equipmentCode] });
      await queryClient.cancelQueries({ queryKey: ['equipmentList'] });

      /** @type {any} */
      const previousEquipment = queryClient.getQueryData(['equipment', equipmentCode]);
      /** @type {{ content?: any[] } | any} */
      const previousList = queryClient.getQueryData(['equipmentList']);

      // optimistic: 단일 설비 캐시 업데이트
      queryClient.setQueryData(['equipment', equipmentCode], old => {
        if (!old || typeof old !== 'object') return old;
        try {
          return Object.assign({}, old, { isActive });
        } catch {
          return old;
        }
      });

      // optimistic: 목록 캐시의 해당 항목 업데이트 (있다면)
      if (previousList && Array.isArray(previousList.content)) {
        queryClient.setQueryData(['equipmentList'], old => {
          if (!old || typeof old !== 'object') return old;
          /** @type {{ content?: any[] }} */
          const copy = Object.assign({}, old);
          copy.content = (copy.content || []).map(row =>
            row && row.equipmentCode === equipmentCode ? Object.assign({}, row, { isActive }) : row,
          );
          return copy;
        });
      }

      return { previousEquipment, previousList };
    },
    // 에러 발생 시 실행
    onError: (err, variables, context) => {
      // rollback
      if (context?.previousEquipment && variables?.equipmentCode) {
        queryClient.setQueryData(['equipment', variables.equipmentCode], context.previousEquipment);
      }
      if (context?.previousList) {
        queryClient.setQueryData(['equipmentList'], context.previousList);
      }
      /** @type {any} */
      const _err = err;
      const message =
        (_err && _err.response && _err.response.data && _err.response.data.message) ||
        '설비 사용여부 업데이트에 실패했습니다.';
      toast.error(message);
    },
    onSettled: (data, error, variables) => {
      // 항상 최신화
      queryClient.invalidateQueries({ queryKey: ['equipmentList'] });
      if (variables?.equipmentCode) {
        queryClient.invalidateQueries({ queryKey: ['equipment', variables.equipmentCode] });
      }
    },
  });

  return {
    updateEquipmentList,
    toggleEquipmentActiveMutation,
  };
}
