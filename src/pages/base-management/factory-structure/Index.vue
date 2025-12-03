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
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">선택된 공장</p>
            <h2 class="text-2xl font-semibold text-gray-900">
              {{ selectedFactory?.factoryName ?? '공장을 선택해주세요' }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              Milo-Server 라인/설비 데이터를 공정 흐름 평면도로 표현했습니다.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div class="rounded-full border border-gray-200 px-4 py-1">라인 {{ lineStructures.length }}개</div>
            <div class="rounded-full border border-gray-200 px-4 py-1">설비 {{ totalEquipmentCount }}개</div>
          </div>
        </div>

        <div class="factory-floor">
          <div class="pipeline">
            <div class="pipeline__rail"></div>
            <div
              v-for="(process, index) in PROCESS_STAGES"
              :key="process.key"
              class="pipeline__stage"
              :data-active="isProcessActive(process.key)"
            >
              <div class="pipeline__machine" :data-machine="process.key">
                <span class="pipeline__stage-number">{{ index + 1 }}</span>
              </div>
              <p class="pipeline__label">{{ process.label }}</p>
              <p class="pipeline__desc">{{ process.description }}</p>
              <div class="pipeline__lines" v-if="stageLineMap[process.key]?.length">
                <span
                  v-for="line in stageLineMap[process.key]"
                  :key="line.lineCode"
                  class="line-token"
                  :class="lineTokenClass(process.key)"
                >
                  {{ line.lineCode }}
                </span>
              </div>
            </div>
          </div>

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

import useFactoryStructure from '@/apis/query-hooks/factory/useFactoryStructure';
import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PROCESS_STAGES = [
  { key: 'mixing', label: '믹싱 공정', description: '원료 혼합', linePrefixes: ['CL'] },
  { key: 'coating', label: '코팅 공정', description: '전극 도포', linePrefixes: ['CL'] },
  { key: 'press', label: '롤 프레싱 공정', description: '압연 공정', linePrefixes: ['CL'] },
  { key: 'slitting', label: '슬리팅 공정', description: '절단 공정', linePrefixes: ['CL'] },
  { key: 'notching', label: '노칭 공정', description: '성형/가공', linePrefixes: ['CL'] },
  { key: 'dryer', label: '드라이어 공정', description: '건조', linePrefixes: ['CL'] },
  { key: 'assembly', label: 'Assembly', description: '조립', linePrefixes: ['PL'] },
  { key: 'activation', label: 'Activation', description: '활성화', linePrefixes: ['CP'] },
];

const PLAN_ZONES = [
  {
    key: 'cl',
    title: '전극/코팅 존',
    subtitle: 'Cell Line (CL)',
    linePrefixes: ['CL'],
    codeLabel: code => `코드 ${code}`,
  },
  {
    key: 'pl',
    title: '조립 존',
    subtitle: 'Pack Line (PL)',
    linePrefixes: ['PL'],
    codeLabel: code => `코드 ${code}`,
  },
  {
    key: 'cp',
    title: '활성화 존',
    subtitle: 'Cell Process (CP)',
    linePrefixes: ['CP'],
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

const { data: factoryList } = useGetFactoryList();
const route = useRoute();
const router = useRouter();

const factories = computed(() => factoryList.value?.content ?? []);
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

const { data: structureResponse } = useFactoryStructure(selectedFactoryCode);

const lineStructures = computed(() => structureResponse.value ?? []);
const totalEquipmentCount = computed(() =>
  lineStructures.value.reduce((sum, line) => sum + line.equipments.length, 0),
);

const planZones = computed(() =>
  PLAN_ZONES.map(zone => ({
    ...zone,
    lines: lineStructures.value.filter(line =>
      zone.linePrefixes.some(prefix => line.lineCode?.startsWith(prefix)),
    ),
  })),
);

const stageLineMap = computed(() => {
  const map = {};
  PROCESS_STAGES.forEach(stage => {
    map[stage.key] = lineStructures.value.filter(line =>
      (stage.linePrefixes ?? []).some(prefix => line.lineCode?.startsWith(prefix)),
    );
  });
  return map;
});

const isProcessActive = processKey => (stageLineMap.value[processKey] ?? []).length > 0;

const lineTokenClass = stageKey => {
  if (stageKey === 'assembly') return 'line-token--pl';
  if (stageKey === 'activation') return 'line-token--cp';
  return 'line-token--cl';
};

const resolveStatusKey = status => {
  if (status === null || status === undefined) return 'UNKNOWN';

  if (typeof status === 'string') {
    const upper = status.toUpperCase();
    if (['RUN', 'RUNNING', 'ACTIVE', 'OPERATION'].includes(upper)) return 'RUNNING';
    if (['IDLE', 'READY', 'STANDBY'].includes(upper)) return 'IDLE';
    if (['MAINTENANCE', 'CHECK', 'FIX'].includes(upper)) return 'MAINTENANCE';
    if (['ERROR', 'DOWN', 'FAIL', 'ALARM'].includes(upper)) return 'ERROR';
  }

  if (typeof status === 'number') {
    if (status === 2) return 'RUNNING';
    if (status === 1) return 'MAINTENANCE';
    if (status === 3) return 'ERROR';
    return 'IDLE';
  }

  return 'UNKNOWN';
};

const summariseEquipments = equipments => {
  const counts = { RUNNING: 0, IDLE: 0, MAINTENANCE: 0, ERROR: 0, UNKNOWN: 0 };
  equipments.forEach(eq => {
    const key = resolveStatusKey(eq.status);
    counts[key] += 1;
  });

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      label: STATUS_META[key].label,
      count,
      classes: STATUS_META[key].classes,
    }));
};
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

.pipeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(8, minmax(80px, 1fr));
  gap: 0.75rem;
  padding-bottom: 2rem;
}

.pipeline__rail {
  position: absolute;
  top: 42px;
  left: 0;
  right: 0;
  height: 20px;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(91, 109, 76, 0.45), rgba(91, 109, 76, 0.08));
  box-shadow: inset 0 0 6px rgba(15, 23, 42, 0.1);
}

.pipeline__stage {
  position: relative;
  text-align: center;
  padding-top: 4.5rem;
  transition: transform 0.2s ease;
}

.pipeline__stage[data-active='true'] {
  transform: translateY(-6px);
}

.pipeline__machine {
  width: 76px;
  height: 76px;
  margin: 0 auto 0.5rem;
  border-radius: 1.25rem;
  background: #e0e7d9;
  border: 2px solid rgba(91, 109, 76, 0.35);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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

.pipeline__machine[data-machine='coating'] {
  border-radius: 50% / 35%;
  background: linear-gradient(180deg, #f8fafc, #d7e0ee);
}

.pipeline__machine[data-machine='press'],
.pipeline__machine[data-machine='slitting'] {
  border-radius: 9999px;
  background: linear-gradient(135deg, #dbeafe, #c7d2fe);
}

.pipeline__machine[data-machine='assembly'],
.pipeline__machine[data-machine='activation'] {
  background: linear-gradient(180deg, #fef3c7, #fde68a);
}

.pipeline__stage-number {
  position: absolute;
  top: -14px;
  right: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #5b6d4c;
  color: white;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(16, 24, 40, 0.1);
}

.pipeline__label {
  margin: 0;
  font-weight: 600;
  color: #111827;
}

.pipeline__desc {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
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
