import apiClient from '@/apis/query-functions/apiClient';

export async function login(params) {
  const response = await apiClient.post(`/auth/login`, params);
  return response;
}

export async function logout() {
  const response = await apiClient.post(`auth/logout`);
  return response;
}
