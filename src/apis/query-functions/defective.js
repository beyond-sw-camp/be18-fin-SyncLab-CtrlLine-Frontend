import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function getDefectiveAll(params = {}) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj).toString();
  const endpoint = search ? `/defectives/all?${search}` : '/defectives/all';
  const { data } = await apiClient.get(endpoint);

  return data.data ?? [];
}

// 불량 상세조회
export async function getDefectiveDetail(defectiveId) {
  const { data } = await apiClient.get(`/defectives/${defectiveId}`);
  return data.data;
}

// 불량 목록조회
export async function getDefectiveList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/defectives?${search.toString()}`);

  return data.data;
}
