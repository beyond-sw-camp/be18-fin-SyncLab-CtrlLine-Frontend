import apiClient from '@/apis/query-functions/apiClient';

export async function getFactoryEnergyLatest(factoryCode) {
  const { data } = await apiClient.get(`/factories/${factoryCode}/energy/latest`);
  return data.data;
}

export async function getFactoryEnergyTodayMax(factoryCode) {
  const { data } = await apiClient.get(`/factories/${factoryCode}/energy/today-max`);
  return data.data;
}
