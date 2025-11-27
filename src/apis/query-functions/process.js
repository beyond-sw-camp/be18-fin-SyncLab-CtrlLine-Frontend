import apiClient from '@/apis/query-functions/apiClient';

// 공정 목록 조회
export async function getProcessList(params) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === 'sort' && Array.isArray(value)) {
      value.forEach(sortItem => {
        query.append('sort', `${sortItem.sortBy},${sortItem.direction}`);
      });
    } else if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const { data } = await apiClient.get(`/processes?${query.toString()}`);
  return data.data;
}

// 공정 상세조회
export async function getProcess(processCode) {
  const { data } = await apiClient.get(`/processes/${processCode}`);
  return data.data;
}
