import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function getLotList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/lots?${search.toString()}`);
  return data.data;
}

export async function getLotDetail(lotId) {
  const { data } = await apiClient.get(`/lots/${lotId}`);
  return data.data;
}

export async function getLotSerials(lotId) {
  const { data } = await apiClient.get(`/lots/${lotId}/serials`);
  return data.data;
}
