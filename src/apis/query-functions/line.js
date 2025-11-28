import apiClient from '@/apis/query-functions/apiClient';

export async function getLineList(params) {
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

  const { data } = await apiClient.get(`/lines?${query.toString()}`);
  return data.data;
}
