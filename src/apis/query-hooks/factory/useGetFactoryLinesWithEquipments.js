import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getEquipmentList } from '@/apis/query-functions/equipment';
import { getLineList } from '@/apis/query-functions/line';
import { useAuthStore } from '@/stores/useAuthStore';

const DEFAULT_LINE_PAGE_SIZE = 200;
const DEFAULT_EQUIPMENT_PAGE_SIZE = 500;

const STAGE_DEFINITIONS = {
  TCP: { index: 0, label: 'Tray Cleaning' },
  EU: { index: 1, label: 'Electrode Unit' },
  AU: { index: 2, label: 'Assembly Unit' },
  FAU: { index: 3, label: 'Formation & Aging' },
  MAP: { index: 4, label: 'Module & Pack' },
  CCP: { index: 5, label: 'Cell Cleaning' },
  FIP: { index: 6, label: 'Final Inspection' },
};

const resolveStage = equipment => {
  const candidates = [equipment.equipmentCode ?? '', equipment.equipmentType ?? ''].map(str =>
    str.toUpperCase(),
  );

  for (const key of Object.keys(STAGE_DEFINITIONS)) {
    if (candidates.some(token => token.includes(key))) {
      return { index: STAGE_DEFINITIONS[key].index, label: STAGE_DEFINITIONS[key].label, code: key };
    }
  }

  return { index: Number.MAX_SAFE_INTEGER, label: '기타', code: null };
};

const normalizeEquipment = equipment => ({
  equipmentId: equipment.id ?? equipment.equipmentId,
  equipmentCode: equipment.equipmentCode,
  equipmentName: equipment.equipmentName,
  equipmentType: equipment.equipmentType,
  lineCode: equipment.lineCode ?? equipment.line?.lineCode ?? null,
  lineId: equipment.lineId ?? equipment.line?.lineId ?? null,
  status: equipment.status ?? equipment.equipmentStatus ?? equipment.state ?? null,
  ...resolveStage(equipment),
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
          const stageDiff = (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER);
          if (stageDiff !== 0) return stageDiff;
          if (!a.equipmentCode || !b.equipmentCode) return 0;
          return a.equipmentCode.localeCompare(b.equipmentCode);
        }),
      }));
    },
  });
}
