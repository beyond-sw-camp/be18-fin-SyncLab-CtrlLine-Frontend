import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getEquipmentList } from '@/apis/query-functions/equipment';
import { getLineList } from '@/apis/query-functions/line';
import { useAuthStore } from '@/stores/useAuthStore';

const DEFAULT_LINE_PAGE_SIZE = 200;
const DEFAULT_EQUIPMENT_PAGE_SIZE = 500;

const normaliseEquipment = equipment => ({
  equipmentId: equipment.id ?? equipment.equipmentId,
  equipmentCode: equipment.equipmentCode,
  equipmentName: equipment.equipmentName,
  lineCode: equipment.lineCode ?? equipment.line?.lineCode ?? null,
  status: equipment.status ?? equipment.equipmentStatus ?? equipment.state ?? null,
  type: equipment.equipmentType,
});

const normaliseLine = line => ({
  lineId: line.id ?? line.lineId,
  lineCode: line.lineCode,
  lineName: line.lineName,
});

export default function useFactoryStructure(factoryCodeRef) {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: ['factoryStructure', factoryCodeRef],
    enabled: computed(() => authStore.isLoggedIn && Boolean(unref(factoryCodeRef))),
    queryFn: async () => {
      const factoryCode = unref(factoryCodeRef);
      if (!factoryCode) return [];

      const [lineResponse, equipmentResponse] = await Promise.all([
        getLineList({
          page: 0,
          size: DEFAULT_LINE_PAGE_SIZE,
          factoryCode,
        }),
        getEquipmentList({
          page: 0,
          size: DEFAULT_EQUIPMENT_PAGE_SIZE,
          factoryCode,
        }),
      ]);

      const lines = (lineResponse?.content ?? []).map(normaliseLine);
      const equipments = (equipmentResponse?.content ?? []).map(normaliseEquipment);

      const equipmentByLineCode = equipments.reduce((acc, equipment) => {
        if (!equipment.lineCode) return acc;
        if (!acc[equipment.lineCode]) acc[equipment.lineCode] = [];
        acc[equipment.lineCode].push(equipment);
        return acc;
      }, {});

      return lines.map(line => ({
        ...line,
        equipments: (equipmentByLineCode[line.lineCode] ?? []).sort((a, b) => {
          if (!a.equipmentCode || !b.equipmentCode) return 0;
          return a.equipmentCode.localeCompare(b.equipmentCode);
        }),
      }));
    },
  });
}
