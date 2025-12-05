import apiClient from '@/apis/query-functions/apiClient';

// 라인 목록 조회
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

// 라인 상세조회
export async function getLine(lineCode) {
  const { data } = await apiClient.get(`/lines/${lineCode}`);
  return data.data;
}

// 라인 상세조회에서 업데이트
export async function updateLine(lineCode, params) {
  const { data } = await apiClient.patch(`/lines/${lineCode}`, params);
  return data;
}

// 라인 목록조회에서 업데이트
export async function updateLineStatusList(params) {
  const { data } = await apiClient.patch('/lines', params);
  return data.data;
}
