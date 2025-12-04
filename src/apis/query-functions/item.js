import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function getItemList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/items?${search.toString()}`);
  return data.data;
}

// 품목 상세조회
export async function getItem(itemId) {
  const { data } = await apiClient.get(`/items/${itemId}`);
  return data.data;
}

// 품목 생성
export async function createItem(params) {
  const { data } = await apiClient.post('/items', params);
  return data.data;
}

// 품목 업데이트
export async function updateItem(itemId, params) {
  const { data } = await apiClient.patch(`/items/${itemId}`, params);
  return data.data;
}
