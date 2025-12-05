import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function getProductionPerformanceList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/production-performances?${search.toString()}`);

  return data.data;
}

export async function getProductionPerformanceMonthlyDefectiveRate(factoryCode, baseMonth) {
  const search = new URLSearchParams();
  if (factoryCode) search.append('factoryCode', factoryCode);
  if (baseMonth) search.append('baseMonth', baseMonth);

  const { data } = await apiClient.get(
    `/production-performances/monthly-defective-rate?${search.toString()}`,
  );

  return data.data;
}

export async function getProductionPerformanceAll(params = {}) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/production-performances/all?${search.toString()}`);
  return data;
}
