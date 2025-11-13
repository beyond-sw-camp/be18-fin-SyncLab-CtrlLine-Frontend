import apiClient from '@/apis/query-functions/apiClient';

export async function createUser(params) {
  const { data } = await apiClient.post(`/users`, params);
  return data.data;
}

export async function getUserList(params) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === 'sort' && Array.isArray(value)) {
      value.forEach(sortItem => {
        query.append('sortBy', sortItem.sortBy);
        query.append('direction', sortItem.direction);
      });
    } else if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const { data } = await apiClient.get(`/users?${query.toString()}`);
  return data.data;
}

export async function getUser(userId) {
  const { data } = await apiClient.get(`/users/${userId}`);
  return data.data;
}
