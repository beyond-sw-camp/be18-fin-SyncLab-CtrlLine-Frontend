import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

import { getEquipmentList } from '@/apis/query-functions/equipment';
import { getLineList } from '@/apis/query-functions/line';
import { useAuthStore } from '@/stores/useAuthStore';

const DEFAULT_LINE_PAGE_SIZE = 200;
const DEFAULT_EQUIPMENT_PAGE_SIZE = 500;

export const STAGE_DEFINITIONS = [
  { code: 'TCP', label: 'Tray Cleaning' },
  { code: 'EU', label: 'Electrode Unit' },
  { code: 'AU', label: 'Assembly Unit' },
  { code: 'FAU', label: 'Formation & Aging' },
  { code: 'MAP', label: 'Module & Pack' },
  { code: 'CCP', label: 'Cell Cleaning' },
  { code: 'FIP', label: 'Final Inspection' },
];

const STAGE_ORDER = STAGE_DEFINITIONS.map(stage => stage.code);
const STAGE_MAP = STAGE_DEFINITIONS.reduce(
  (acc, stage, index) => ({
    ...acc,
    [stage.code]: { ...stage, index },
  }),
  {},
);
const MATCH_PRIORITY_CODES = [...STAGE_DEFINITIONS]
  .sort((a, b) => b.code.length - a.code.length)
  .map(stage => stage.code);

const resolveStage = equipment => {
  const candidates = [equipment.equipmentCode ?? '', equipment.equipmentType ?? ''].map(str =>
    str.toUpperCase(),
  );

  for (const code of MATCH_PRIORITY_CODES) {
    if (candidates.some(token => token.includes(code))) {
      return { code, label: STAGE_MAP[code].label, index: STAGE_MAP[code].index };
    }
  }

  return { code: null, label: '기타', index: Number.MAX_SAFE_INTEGER };
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

      return lines.map(line => {
        const equipments = (equipmentByLineId[line.lineId ?? line.lineCode] ?? []).sort((a, b) => {
          const stageDiff =
            (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER);
          if (stageDiff !== 0) return stageDiff;
          if (!a.equipmentCode || !b.equipmentCode) return 0;
          return a.equipmentCode.localeCompare(b.equipmentCode);
        });

        const stageBuckets = STAGE_ORDER.reduce((acc, code) => {
          acc[code] = [];
          return acc;
        }, {});

        equipments.forEach(equipment => {
          const bucketKey = STAGE_ORDER.includes(equipment.code) ? equipment.code : STAGE_ORDER.at(-1);
          stageBuckets[bucketKey].push(equipment);
        });

        return {
          ...line,
          equipments,
          stageBuckets,
        };
      });
    },
  });
}
