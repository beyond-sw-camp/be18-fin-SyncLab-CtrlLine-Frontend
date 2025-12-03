import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

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
  return data.data;
}
