import { useQuery } from '@tanstack/vue-query';

import { getUser } from '@/apis/query-functions/user';

export default function useGetUser(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
  });
}
