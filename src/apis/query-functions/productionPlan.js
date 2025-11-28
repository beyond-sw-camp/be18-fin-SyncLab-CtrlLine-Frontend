import apiClient from '@/apis/query-functions/apiClient';

export async function createProductionPlan(params) {
  const { data } = await apiClient.post(`/production-plans`, params);
  return data.data;
}

export async function getProductionPlanList(params) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === 'sort' && Array.isArray(value)) {
      value.forEach(sortItem => {
        query.append('sort', sortItem);
      });
    } else if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const { data } = await apiClient.get(`/production-plans?${query.toString()}`);

  return data.data;
}

export async function getProductionPlan(productionPlanId) {
  const { data } = await apiClient.get(`/production-plans/${productionPlanId}`);

  console.log(data.data);
  return data.data;
}

export async function updateProductionPlan(productionPlanId, params) {
  const { data } = await apiClient.put(`/production-plans/${productionPlanId}`, params);
  return data.data;
}
