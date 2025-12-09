import apiClient from '@/apis/query-functions/apiClient';

export async function getLineProductionProgress(factoryCode) {
  const search = new URLSearchParams();
  if (factoryCode) {
    search.append('factoryCode', factoryCode);
  }
  const { data } = await apiClient.get(`/production-progress/lines${search.toString() ? `?${search.toString()}` : ''}`);
  return data;
}
