import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function getLogList(params = {}) {
  const queryParams = buildQueryObject(params);
  const searchParams = new URLSearchParams(queryParams);
  const search = searchParams.toString();

  const endpoint = search ? `/logs?${search}` : '/logs';
  const { data } = await apiClient.get(endpoint);

  return data.data;
}
