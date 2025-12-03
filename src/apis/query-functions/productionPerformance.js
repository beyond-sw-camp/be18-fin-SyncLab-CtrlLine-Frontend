import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function getProductionPerformanceList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/production-performances?${search.toString()}`);

  return data.data;
}

export async function getProductionPerformance(id) {
  const { data } = await apiClient.get(`/production-performances/${id}`);
  return data.data;
}
