import apiClient from '@/apis/query-functions/apiClient';

export async function getFactoryEnvironmentLatest(factoryCode) {
  const { data } = await apiClient.get(`/factories/${factoryCode}/environment/latest`);
  return data.data;
}

export async function getFactoryEnvironmentHistory(factoryCode) {
  const { data } = await apiClient.get(`/factories/${factoryCode}/environment`);
  return data.data;
}
