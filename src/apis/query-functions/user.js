import apiClient from '@/apis/query-functions/apiClient';
import { buildQueryObject } from '@/utils/buildQueryObject';

export async function createUser(params) {
  const { data } = await apiClient.post(`/users`, params);
  return data.data;
}

export async function getUserList(params) {
  const queryObj = buildQueryObject(params);
  const search = new URLSearchParams(queryObj);

  const { data } = await apiClient.get(`/users?${search.toString()}`);
  return data.data;
}

export async function getUser(userId) {
  const { data } = await apiClient.get(`/users/${userId}`);
  return data.data;
}

export async function updateUser(userId, params) {
  const { data } = await apiClient.patch(`/users/${userId}`, params);

  return data.data;
}

// ============ 내 정보 ============

export async function getMyInfo() {
  const { data } = await apiClient.get(`/users/me`);
  return data.data;
}

export async function updateMyInfo(params) {
  const { data } = await apiClient.patch(`/users/me`, params);
  return data.data;
}
