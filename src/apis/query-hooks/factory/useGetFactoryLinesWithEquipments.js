import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getEquipmentList } from '@/apis/query-functions/equipment';
import { getLineList } from '@/apis/query-functions/line';
import { useAuthStore } from '@/stores/useAuthStore';

const DEFAULT_LINE_PAGE_SIZE = 200;
const DEFAULT_EQUIPMENT_PAGE_SIZE = 500;

const normalizeEquipment = equipment => ({
  equipmentId: equipment.id ?? equipment.equipmentId,
  equipmentCode: equipment.equipmentCode,
  equipmentName: equipment.equipmentName,
  lineCode: equipment.lineCode ?? equipment.line?.lineCode ?? null,
  lineId: equipment.lineId ?? equipment.line?.lineId ?? null,
  status: equipment.status ?? equipment.equipmentStatus ?? equipment.state ?? null,
});

const normalizeLine = line => ({
  lineId: line.id ?? line.lineId,
  lineCode: line.lineCode,
  lineName: line.lineName,
});

export default function useGetFactoryLinesWithEquipments(factoryIdRef) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['factoryLinesWithEquipments', factoryIdRef],
    enabled: computed(() => authStore.isLoggedIn && Boolean(unref(factoryIdRef))),
    queryFn: async () => {
      const factoryId = unref(factoryIdRef);
      if (!factoryId) return [];

      const [lineResponse, equipmentResponse] = await Promise.all([
        getLineList({
          page: 0,
          size: DEFAULT_LINE_PAGE_SIZE,
          factoryId,
        }),
        getEquipmentList({
          page: 0,
          size: DEFAULT_EQUIPMENT_PAGE_SIZE,
          factoryId,
        }),
      ]);

      const lines = (lineResponse?.content ?? []).map(normalizeLine);
      const equipments = (equipmentResponse?.content ?? []).map(normalizeEquipment);

      const equipmentByLineId = equipments.reduce((acc, equipment) => {
        const key = equipment.lineId ?? equipment.lineCode;
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(equipment);
        return acc;
      }, {});

      return lines.map(line => ({
        ...line,
        equipments: (equipmentByLineId[line.lineId ?? line.lineCode] ?? []).sort((a, b) => {
          if (!a.equipmentCode || !b.equipmentCode) return 0;
          return a.equipmentCode.localeCompare(b.equipmentCode);
        }),
      }));
    },
  });
}
