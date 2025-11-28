import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function getItemList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/items?${search.toString()}`);
  return data.data;
}

export async function getItem(itemId) {
  const { data } = await apiClient.get(`/items/${itemId}`);
  return data.data;
}
