import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

// 라인 목록 조회
export async function getLineList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/lines?${search.toString()}`);
  return data.data;
}

// 라인 상세조회
export async function getLine(lineCode) {
  const { data } = await apiClient.get(`/lines/${lineCode}`);
  return data.data;
}

// 라인 업데이트
export async function updateLine(lineCode, params) {
  const { data } = await apiClient.patch(`/lines/${lineCode}`, params);
  return data;
}
