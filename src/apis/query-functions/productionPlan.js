import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function createProductionPlan(params) {
  const { data } = await apiClient.post(`/production-plans`, params);
  return data.data;
}

export async function getProductionPlanList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/production-plans?${search.toString()}`);

  return data.data;
}

export async function getProductionPlanScheduleList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/production-plans/schedules?${search.toString()}`);

  return data.data;
}

export async function getProductionPlan(productionPlanId) {
  const { data } = await apiClient.get(`/production-plans/${productionPlanId}`);
  return data.data;
}

export async function updateProductionPlan(productionPlanId, params) {
  const { data } = await apiClient.patch(`/production-plans/${productionPlanId}`, params);
  return data.data;
}

export async function updateProductionPlanStatusList(params) {
  const { data } = await apiClient.patch(`/production-plans/status`, params);
  return data.data;
}

export async function deleteProductionPlan(productionPlanId) {
  console.log(productionPlanId);
  const { data } = await apiClient.delete(`/production-plans/${productionPlanId}`);
  return data.data;
}

export async function deleteProductionPlanList(params) {
  const { data } = await apiClient.delete(`/production-plans`, {
    data: params,
  });

  return data.data;
}

// ============ 생산계획 현황 ============

export async function getProductionPlanAll(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/production-plans/all?${search.toString()}`);
  return data.data;
}
