import apiClient from '@/apis/query-functions/apiClient';

export async function getFactoryList(params) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === 'sort' && Array.isArray(value)) {
      value.forEach(sortItem => {
        query.append('sort', sortItem.sortBy);
      });
    } else if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const { data } = await apiClient.get(`/factories?${query.toString()}`);
  return data.data;
}

export async function getFactory(factoryCode) {
  const { data } = await apiClient.get(`/factories/${factoryCode}`);
  return data.data;
}

export async function updateFactoryStatus(factoryCode, params) {
  const { data } = await apiClient.patch(`/factories/${factoryCode}`, params);
  return data.data;
}
