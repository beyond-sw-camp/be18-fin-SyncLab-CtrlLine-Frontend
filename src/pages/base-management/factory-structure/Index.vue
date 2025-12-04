<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4">
      <Tabs v-if="factories.length" v-model="selectedFactoryCode" class="w-full lg:w-fit">
        <TabsList class="flex-wrap justify-start gap-2">
          <TabsTrigger
            v-for="factory in factories"
            :key="factory.factoryCode"
            :value="factory.factoryCode"
            class="min-w-28"
          >
            {{ factory.factoryName }}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        v-else
        class="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500"
      >
        공장 목록을 불러오는 중입니다...
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div></div>

        <div class="factory-floor">
          <TooltipProvider delay-duration="150">
            <div class="line-rack-grid">
              <article
                v-for="line in lineStructures"
                :key="line.lineCode"
                class="line-floor-plan"
                :data-type="line.type"
            >
              <header class="line-floor-plan__header">
                <div>
                  <p class="line-floor-plan__title">{{ line.displayLabel }}</p>
                  <p class="line-floor-plan__code">{{ line.lineCode }}</p>
                </div>
                <span class="line-floor-plan__badge">라인</span>
              </header>

              <div class="line-floor-plan__body">
                <div class="pipeline">
                  <div class="pipeline__rail"></div>
                  <Tooltip
                    v-for="(equipment, index) in EQUIPMENT_LAYOUT"
                    :key="equipment.key"
                  >
                    <TooltipTrigger as-child>
                      <div
                        class="pipeline__node"
                        :data-position="equipment.position"
                      >
                        <div
                          class="pipeline__machine"
                          :data-active="(equipment.lineTypes ?? ['CL', 'PL', 'CP']).includes(line.type)"
                        >
                          <component :is="equipment.icon" class="equipment-icon" aria-hidden="true" />
                          <span class="pipeline__stage-number">{{ index + 1 }}</span>
                        </div>
                        <p class="pipeline__equip-label">{{ equipment.label }}</p>
                      </div>
                    </TooltipTrigger>

                    <TooltipContent class="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-xl">
                      <p class="text-xs font-semibold text-gray-800">{{ equipment.label }}</p>
                      <p class="text-[11px] text-gray-500">{{ tooltipDescription(equipment.label) }}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </article>
            </div>
          </TooltipProvider>

          <div class="sub-process-grid">
            <div class="sub-process" data-type="assembly">
              <header class="sub-process__header">
                <h3>Assembly Process</h3>
                <p>Dry Room</p>
              </header>
              <div class="sub-process__steps">
                <div v-for="step in ASSEMBLY_STEPS" :key="step.key" class="sub-process__step">
                  {{ step.label }}
                </div>
              </div>
              <div class="sub-process__lines">
                <span
                  v-for="line in stageLineMap.assembly ?? []"
                  :key="line.lineCode"
                  class="line-token line-token--pl"
                >
                  {{ line.lineCode }}
                </span>
                <p v-if="!(stageLineMap.assembly ?? []).length" class="sub-process__empty">
                  조립 라인 데이터가 없습니다.
                </p>
              </div>
            </div>

            <div class="sub-process" data-type="activation">
              <header class="sub-process__header">
                <h3>Activation Process</h3>
                <p>Formation / Aging</p>
              </header>
              <div class="sub-process__steps">
                <div v-for="step in ACTIVATION_STEPS" :key="step.key" class="sub-process__step">
                  {{ step.label }}
                </div>
              </div>
              <div class="sub-process__lines">
                <span
                  v-for="line in stageLineMap.activation ?? []"
                  :key="line.lineCode"
                  class="line-token line-token--cp"
                >
                  {{ line.lineCode }}
                </span>
                <p v-if="!(stageLineMap.activation ?? []).length" class="sub-process__empty">
                  활성화 라인 데이터가 없습니다.
                </p>
              </div>
            </div>
          </div>

          <div class="zone-grid">
            <article v-for="zone in planZones" :key="zone.key" class="zone-card">
              <header class="zone-card__header">
                <div>
                  <p class="zone-card__title">{{ zone.title }}</p>
                  <p class="zone-card__subtitle">{{ zone.subtitle }}</p>
                </div>
                <span class="zone-card__badge">{{ zone.lines.length }}개 라인</span>
              </header>
              <div class="zone-card__lines" :data-empty="!zone.lines.length">
                <template v-if="zone.lines.length">
                  <div v-for="line in zone.lines" :key="line.lineCode" class="line-chip">
                    <div class="line-chip__header">
                      <strong>{{ line.lineName || zone.codeLabel(line.lineCode) }}</strong>
                      <span>{{ line.lineCode }}</span>
                    </div>
                    <div class="line-chip__equipments">
                      <template v-if="line.equipments.length">
                        <span
                          v-for="meta in summariseEquipments(line.equipments)"
                          :key="meta.key"
                          class="equipment-pill"
                          :class="meta.classes"
                        >
                          {{ meta.label }} {{ meta.count }}
                        </span>
                      </template>
                      <span v-else class="text-xs text-gray-400">설비 데이터가 없습니다.</span>
                    </div>
                  </div>
                </template>
                <p v-else class="text-sm text-gray-400">해당 존에 연결된 라인이 없습니다.</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { BatteryCharging, Boxes, Droplet, Puzzle, ShieldCheck, Sparkles, Zap } from 'lucide-vue-next';
import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EQUIPMENT_GROUPS = [
  { label: 'Tray Cleaner', icon: Sparkles },
  { label: 'Electrode Unit', icon: Zap },
  { label: 'Assembly Unit', icon: Puzzle },
  { label: 'Formation Unit', icon: BatteryCharging },
  { label: 'Module & Pack', icon: Boxes },
  { label: 'Cell Cleaner', icon: Droplet },
  { label: 'Final Inspection', icon: ShieldCheck },
];

const EQUIPMENT_LAYOUT = EQUIPMENT_GROUPS.flatMap((group, groupIndex) =>
  Array.from({ length: 2 }, (_, offset) => {
    const absoluteIndex = groupIndex * 2 + offset;
    return {
      key: `${group.label}-${offset}`,
      label: group.label,
      icon: group.icon,
      position: absoluteIndex % 2 === 0 ? 'top' : 'bottom',
      lineTypes: ['CL', 'PL', 'CP'],
    };
  }),
);

const PLAN_ZONES = [
  {
    key: 'cl',
    title: '전극/코팅 존',
    subtitle: 'Cell Line (CL)',
    lineTypes: ['CL'],
    codeLabel: code => `코드 ${code}`,
  },
  {
    key: 'pl',
    title: '조립 존',
    subtitle: 'Pack Line (PL)',
    lineTypes: ['PL'],
    codeLabel: code => `코드 ${code}`,
  },
  {
    key: 'cp',
    title: '활성화 존',
    subtitle: 'Cell Process (CP)',
    lineTypes: ['CP'],
    codeLabel: code => `코드 ${code}`,
  },
];

const STATUS_META = {
  RUNNING: {
    label: '가동',
    classes: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  IDLE: {
    label: '대기',
    classes: 'bg-slate-50 border-slate-200 text-slate-600',
  },
  MAINTENANCE: {
    label: '점검',
    classes: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  ERROR: {
    label: '고장',
    classes: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  UNKNOWN: {
    label: '확인 필요',
    classes: 'bg-gray-50 border-gray-200 text-gray-600',
  },
};

const ASSEMBLY_STEPS = [
  { key: 'packaging', label: 'Packaging' },
  { key: 'electrolyte', label: 'Electrolyte' },
  { key: 'sealing', label: 'Sealing' },
  { key: 'welding', label: 'Welding' },
  { key: 'forming', label: 'Al Forming' },
  { key: 'folding', label: 'Folding' },
  { key: 'lamination', label: 'Lamination' },
  { key: 'anode', label: 'Anode' },
  { key: 'cathode', label: 'Cathode' },
];

const ACTIVATION_STEPS = [
  { key: 'formation', label: 'Formation' },
  { key: 'aging', label: 'Aging' },
  { key: 'degas', label: 'Degas' },
  { key: 'grading', label: 'Grading' },
];

const tooltipDescription = label => {
  const descriptions = {
    'Tray Cleaner': 'DryCleaner 설비 · 트레이 표면 이물 제거',
    'Electrode Unit': '전극 조립 모듈 · 극판 압입',
    'Assembly Unit': '셀 케이스 및 스택 조립',
    'Formation Unit': '충방전 및 활성화 공정',
    'Module & Pack': '모듈화 및 팩 조립',
    'Cell Cleaner': '셀 외면 세정 · 이물 제거',
    'Final Inspection': '최종 검사 · 품질 판정',
  };
  return descriptions[label] ?? '2차전지 생산 설비';
};

const FACTORY_LINE_PRESETS = {
  F0001: [
    { lineCode: 'CL0001', lineName: '원형전지라인', type: 'CL' },
    { lineCode: 'PL0001', lineName: '각형전지라인', type: 'PL' },
    { lineCode: 'CP0001', lineName: '복합전지라인', type: 'CP' },
  ],
  F0002: [
    { lineCode: 'CL0002', lineName: '원형전지라인', type: 'CL' },
    { lineCode: 'PL0002', lineName: '각형전지라인', type: 'PL' },
    { lineCode: 'CP0002', lineName: '복합전지라인', type: 'CP' },
  ],
  F0003: [
    { lineCode: 'CL0003', lineName: '원형전지라인', type: 'CL' },
    { lineCode: 'PL0003', lineName: '각형전지라인', type: 'PL' },
    { lineCode: 'CP0003', lineName: '복합전지라인', type: 'CP' },
  ],
};

const FALLBACK_FACTORIES = [
  { factoryCode: 'F0001', factoryName: '제1공장' },
  { factoryCode: 'F0002', factoryName: '제2공장' },
  { factoryCode: 'F0003', factoryName: '제3공장' },
];

const { data: factoryList } = useGetFactoryList();
const route = useRoute();
const router = useRouter();

const factories = computed(() => {
  const remote = factoryList.value?.content ?? [];
  return remote.length ? remote : FALLBACK_FACTORIES;
});
const selectedFactoryCode = ref(route.query.factory ?? '');

watch(
  factories,
  list => {
    if (!list.length) return;
    const fromQuery = route.query.factory;
    if (fromQuery && list.some(factory => factory.factoryCode === fromQuery)) {
      selectedFactoryCode.value = fromQuery;
      return;
    }
    if (!selectedFactoryCode.value) {
      selectedFactoryCode.value = list[0].factoryCode;
    }
  },
  { immediate: true },
);

watch(
  () => route.query.factory,
  factoryCode => {
    if (factoryCode && factoryCode !== selectedFactoryCode.value) {
      selectedFactoryCode.value = factoryCode;
    }
  },
);

watch(selectedFactoryCode, value => {
  if (!value) return;
  router.replace({
    query: { ...route.query, factory: value },
  });
});

const selectedFactory = computed(() =>
  factories.value.find(factory => factory.factoryCode === selectedFactoryCode.value),
);

const lineStructures = computed(() => {
  const factoryCode = selectedFactory.value?.factoryCode;
  const baseLines = FACTORY_LINE_PRESETS[factoryCode] ?? [];
  return baseLines.map(line => ({
    ...line,
    instanceIndex: 0,
    displayLabel: line.lineName,
    equipments: [],
  }));
});
const planZones = computed(() =>
  PLAN_ZONES.map(zone => ({
    ...zone,
    lines: lineStructures.value.filter(line => zone.lineTypes.includes(line.type)),
  })),
);

const stageLineMap = computed(() => ({
  assembly: lineStructures.value.filter(line => line.type === 'PL'),
  activation: lineStructures.value.filter(line => line.type === 'CP'),
}));

const summariseEquipments = () => [];
</script>

<style scoped>
.factory-floor {
  position: relative;
  padding: 2.5rem 1.5rem 1.5rem;
  border-radius: 1.75rem;
  background: radial-gradient(circle at top left, rgba(91, 109, 76, 0.09), transparent 45%),
    radial-gradient(circle at bottom right, rgba(91, 109, 76, 0.12), transparent 40%),
    linear-gradient(180deg, #fdfefe 0%, #f5f7f2 100%);
  overflow: hidden;
}

.line-rack-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.line-floor-plan {
  border-radius: 1.5rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.line-floor-plan__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.line-floor-plan__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.line-floor-plan__code {
  margin: 0;
  font-size: 0.85rem;
  color: #475467;
}

.line-floor-plan__badge {
  border-radius: 9999px;
  padding: 0.2rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(91, 109, 76, 0.1);
  color: #405531;
}

.line-floor-plan__body {
  padding: 1.5rem;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.1), rgba(255, 255, 255, 0.5));
}

.pipeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(14, minmax(50px, 1fr));
  gap: 0.35rem;
  padding: 2.5rem 0;
}

.pipeline__rail {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  height: 18px;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(91, 109, 76, 0.45), rgba(91, 109, 76, 0.08));
  box-shadow: inset 0 0 6px rgba(15, 23, 42, 0.1);
}

.pipeline__node {
  position: relative;
  height: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.pipeline__node[data-position='bottom'] {
  justify-content: flex-end;
}

.pipeline__node[data-position='top'] .pipeline__machine {
  transform: translateY(-45px);
}

.pipeline__node[data-position='bottom'] .pipeline__machine {
  transform: translateY(45px);
}

.pipeline__machine {
  width: 88px;
  height: 88px;
  border-radius: 1.25rem;
  background: #e0e7d9;
  border: 2px solid rgba(91, 109, 76, 0.35);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.pipeline__machine::after {
  content: '';
  position: absolute;
  width: 60%;
  height: 12px;
  background: rgba(79, 70, 229, 0.25);
  bottom: 10px;
  left: 20%;
  border-radius: 9999px;
}

.pipeline__stage-number {
  position: absolute;
  top: -14px;
  right: -8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #5b6d4c;
  color: white;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(16, 24, 40, 0.1);
}

.equipment-icon {
  width: 28px;
  height: 28px;
  color: #405531;
}

.pipeline__equip-label {
  margin: 0.4rem 0 0;
  font-size: 0.72rem;
  text-align: center;
  color: #1f2937;
  font-weight: 600;
}

.pipeline__node[data-position='top'] .pipeline__equip-label {
  order: -1;
  margin: 0 0 0.4rem;
}

.pipeline__node[data-position='bottom'] .pipeline__equip-label {
  order: 1;
  margin: 0.4rem 0 0;
}

.pipeline__lines {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: center;
}

.line-token {
  border-radius: 9999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: #fff;
}

.line-token--cl {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(191, 219, 254, 0.35);
  color: #0f172a;
}

.line-token--pl {
  border-color: rgba(248, 180, 0, 0.5);
  background: rgba(254, 243, 199, 0.6);
  color: #854d0e;
}

.line-token--cp {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(167, 243, 208, 0.6);
  color: #065f46;
}

.sub-process-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.sub-process {
  border: 2px dashed rgba(148, 163, 184, 0.7);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 1.25rem;
  position: relative;
}

.sub-process__header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.sub-process__header p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.sub-process__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.sub-process__step {
  flex: 1;
  min-width: 100px;
  padding: 0.4rem 0.6rem;
  border-radius: 0.75rem;
  border: 1px dashed rgba(148, 163, 184, 0.7);
  font-size: 0.78rem;
  text-align: center;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.02));
}

.sub-process__lines {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.sub-process__empty {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.zone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.zone-card {
  border-radius: 1.25rem;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.4);
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.zone-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.5);
}

.zone-card__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.zone-card__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.zone-card__badge {
  border-radius: 9999px;
  padding: 0.2rem 0.8rem;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 0.82rem;
}

.zone-card__lines {
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.line-chip {
  border: 1px solid rgba(148, 163, 184, 0.6);
  border-radius: 0.85rem;
  padding: 0.75rem;
  background: #f8fafc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.line-chip__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.line-chip__header span {
  font-size: 0.8rem;
  color: #64748b;
}

.line-chip__equipments {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.equipment-pill {
  border-radius: 9999px;
  border: 1px solid;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
