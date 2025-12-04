import apiClient from '@/apis/query-functions/apiClient';

export async function getDefectiveTypes(factoryCode) {
  const { data } = await apiClient.get('/defectives/types', {
    params: { factoryCode },
  });
  return data.data;
}
