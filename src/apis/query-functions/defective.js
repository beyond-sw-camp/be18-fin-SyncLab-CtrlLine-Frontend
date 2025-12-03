import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

<<<<<<< HEAD
// 불량 목록 조회
export async function getDefectiveList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/defectives?${search.toString()}`);
  return data.data;
}

// 불량 상세조회
export async function getDefective(planDefectiveId) {
  const { data } = await apiClient.get(`/defectives/${planDefectiveId}`);
=======
export async function getDefectiveAll(params = {}) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj).toString();
  const endpoint = search ? `/defectives/all?${search}` : '/defectives/all';
  const { data } = await apiClient.get(endpoint);

  return data.data ?? [];
}

export async function getDefectiveDetail(defectiveId) {
  const { data } = await apiClient.get(`/defectives/${defectiveId}`);
>>>>>>> 32499d395a010dabf32ab5eff5b62c3b645d3b8f
  return data.data;
}
