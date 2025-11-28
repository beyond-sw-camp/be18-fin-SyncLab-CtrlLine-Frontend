import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { updateLine } from '@/apis/query-functions/line';

export default function useUpdateLine(lineCode) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: params => updateLine(lineCode, params),
    onSuccess: () => {
      toast.success('라인 사용여부를 수정했습니다.');
      queryClient.invalidateQueries({ queryKey: ['line', lineCode] });
      queryClient.invalidateQueries({ queryKey: ['lineList'] });
      router.push('/base-management/lines');
    },
    onError: error => {
      toast.error(error.message);
    },
  });
}
