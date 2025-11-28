import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateProcess } from '@/apis/query-functions/process';

export default function useUpdateProcess(processCode) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: params => updateProcess(processCode, params),
    onSuccess: () => {
      toast.success('공정 사용여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['process', processCode] });
      queryClient.invalidateQueries({ queryKey: ['processList'] });
      router.push('/base-management/processes');
    },
    onError: error => {
      toast.error(error.message);
    },
  });
}
