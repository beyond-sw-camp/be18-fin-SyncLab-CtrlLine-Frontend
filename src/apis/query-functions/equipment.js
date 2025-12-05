import apiClient from '@/apis/query-functions/apiClient';

// 설비 목록 조회
export async function getEquipmentList(params) {
  // Get 요청 파라미터를 쿼리스트링으로 만든다.
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params || {})) {
    if (key === 'sort' && Array.isArray(value)) {
      value.forEach(sortItem => query.append('sort', sortItem));
      // 빈 파라미터는 쿼리에서 제외
    } else if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  // 쿼리스트링 붙여서, GET 요청
  const { data } = await apiClient.get(`/equipments?${query.toString()}`);
  return data.data;
}

// 설비 상세조회
export async function getEquipment(equipmentCode) {
  const { data } = await apiClient.get(`/equipments/${equipmentCode}`);
  return data.data;
}

// 설비 업데이트 (담당자와 사용여부 변경 가능)
export async function updateEquipment(equipmentCode, params) {
  const { data } = await apiClient.patch(`/equipments/${equipmentCode}`, params);
  return data;
}

export async function getEquipmentStatuses(params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const queryString = query.toString();
  const url = queryString ? `/equipments/statuses?${queryString}` : '/equipments/statuses';
  const { data } = await apiClient.get(url);
  return data.data;
}

// 설비 상태 일괄 업데이트
export async function updateEquipmentStatusList(params) {
  const { data } = await apiClient.patch('/equipments', params);
  return data.data;
}
