import apiClient from '@/apis/query-functions/apiClient';

export async function getItemLineList(lineCode) {
  const { data } = await apiClient.get(`/item-lines/${lineCode}`);
  return data.data;
}

export async function updateItemLine(lineCode, params) {
  const { data } = await apiClient.put(`/item-lines/${lineCode}`, params);
  return data.data;
}
