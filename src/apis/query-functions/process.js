import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

// 공정 목록 조회
export async function getProcessList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/processes?${search.toString()}`);
  return data.data;
}

// 공정 상세조회
export async function getProcess(processCode) {
  const { data } = await apiClient.get(`/processes/${processCode}`);
  return data.data;
}
