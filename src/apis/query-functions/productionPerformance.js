import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function getProductionPerformanceList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/production-performances?${search.toString()}`);

  return data.data;
}

export async function getProductionPerformance(productionPerformanceId) {
  const { data } = await apiClient.get(`/production-performances/${productionPerformanceId}`);
  return data.data;
}
