import apiClient from '@/apis/query-functions/apiClient';

export async function getDefectiveList(params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const search = query.toString();
  const { data } = await apiClient.get(`/defectives?${search}`);
  return data.data;
}

export async function getDefectiveAll(params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const search = query.toString();
  const { data } = await apiClient.get(`/defectives/all?${search}`);
  return data.data;
}

export async function getDefectiveDetail(planDefectiveId) {
  const { data } = await apiClient.get(`/defectives/${planDefectiveId}`);
  return data.data;
}

export async function getDefectiveTypes(factoryCode) {
  const { data } = await apiClient.get('/defectives/types', {
    params: { factoryCode },
  });
  return data.data;
}
