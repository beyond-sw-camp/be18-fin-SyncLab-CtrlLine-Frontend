import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

// 생산 실적 목록조회
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

// 생산실적 출력물
export async function getProductionPerformanceAll(params = {}) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/production-performances/all?${search.toString()}`);
  return data;
}

// 생산 실적 상세조회
export async function getProductionPerformance(productionPerformanceId) {
  const { data } = await apiClient.get(`/production-performances/${productionPerformanceId}`);
  return data.data;
}

// 생산 실적 업데이트('비고'만 가능)
export async function updateProductionPerformance(productionPerformanceId, params) {
  const { data } = await apiClient.patch(
    `/production-performances/${productionPerformanceId}`,
    params,
  );
  return data;
}
