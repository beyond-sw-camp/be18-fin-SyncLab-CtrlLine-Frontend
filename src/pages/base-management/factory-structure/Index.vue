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
                  <div
                    v-for="(equipment, index) in EQUIPMENT_LAYOUT"
                    :key="equipment.key"
                    class="pipeline__node"
                    :class="`pipeline__node--${equipment.position}`"
                    :style="{ gridColumn: equipment.gridColumn, gridRow: equipment.gridRow }"
                  >
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <button
                          type="button"
                          class="pipeline__machine"
                          :data-active="(equipment.lineTypes ?? ['CL', 'PL', 'CP']).includes(line.type)"
                          @click.stop="openEquipmentModal(equipment)"
                        >
                          <component :is="equipment.icon" class="equipment-icon" aria-hidden="true" />
                          <span class="pipeline__stage-number">{{ index + 1 }}</span>
                        </button>
                      </TooltipTrigger>

                      <TooltipContent
                        class="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-xl"
                        side="top"
                        :side-offset="8"
                      >
                        <p class="text-xs font-semibold text-gray-800">{{ equipment.label }}</p>
                        <p class="text-[11px] text-gray-500">{{ tooltipDescription(equipment.label) }}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </article>
            </div>
          </TooltipProvider>

          <Dialog :open="isEquipmentModalOpen" @update:open="val => (!val ? closeEquipmentModal() : null)">
            <DialogContent class="max-w-xl rounded-3xl border border-gray-200 p-6 shadow-2xl">
              <DialogHeader>
                <DialogTitle class="text-2xl font-semibold text-gray-900">
                  {{ activeEquipment?.label ?? '설비 정보' }}
                </DialogTitle>
                <DialogDescription class="text-sm text-gray-500">
                  {{ tooltipDescription(activeEquipment?.label) }}
                </DialogDescription>
              </DialogHeader>

              <div class="mt-4 space-y-3" v-if="activeEquipment?.processes?.length">
                <p class="text-sm font-semibold text-gray-700">주요 공정</p>
                <ul class="equipment-process-list">
                  <li v-for="step in activeEquipment.processes" :key="step.name">
                    <p class="font-medium text-gray-900">{{ step.name }}</p>
                    <p class="text-sm text-gray-500">{{ step.desc }}</p>
                  </li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { BatteryCharging, Boxes, Droplet, Puzzle, ShieldCheck, Sparkles, Zap } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EQUIPMENT_GROUPS = [
  {
    label: 'Tray Dry Cleaning Unit',
    icon: Sparkles,
    processes: [
      { name: 'Tray Loading System', desc: '빈 트레이 투입 공정' },
      { name: 'Dry Cleaning Process', desc: '에어 블로우 · 정전기 제거' },
      { name: 'Static Neutralizer', desc: '이온 발생기로 정전기 중화' },
      { name: 'Tray Buffer Conveyor', desc: '세정 완료 트레이 대기' },
    ],
  },
  {
    label: 'Electrode Unit',
    icon: Zap,
    processes: [
      { name: 'Mixing Process', desc: '슬러리 혼합 공정' },
      { name: 'Coating Process', desc: '슬러리 도포 공정' },
      { name: 'Drying Oven Process', desc: '건조 공정' },
      { name: 'Calender Press Process', desc: '압연 공정' },
      { name: 'Slitting Process', desc: '전극 절단 공정' },
      { name: 'Tray Loading Process', desc: '전극 적재 공정' },
    ],
  },
  {
    label: 'Assembly Unit',
    icon: Puzzle,
    processes: [
      { name: 'Notching Process', desc: '셀 시트 절단 공정' },
      { name: 'Stacking / Winding Process', desc: '적층 · 권취 공정' },
      { name: 'Tab Welding Process', desc: '탭 용접 공정' },
      { name: 'Cell Enclosing Process', desc: '봉입 공정' },
      { name: 'Electrolyte Filling Process', desc: '전해액 주입 공정' },
    ],
  },
  {
    label: 'Formation Unit',
    icon: BatteryCharging,
    processes: [
      { name: 'Formation Rack', desc: '충방전 공정' },
      { name: 'Aging Chamber', desc: 'Aging 보관' },
    ],
  },
  {
    label: 'Module & Pack Unit',
    icon: Boxes,
    processes: [
      { name: 'Cell Sorting Process', desc: '셀 분류 공정' },
      { name: 'Module Assembly Process', desc: '모듈 조립 공정' },
      { name: 'BMS Test Process', desc: '관리시스템 검사 공정' },
    ],
  },
  {
    label: 'Cell Cleaning Unit',
    icon: Droplet,
    processes: [
      { name: 'Unloading Station', desc: '모듈 완료 셀 분리 공정' },
      { name: 'Ultrasonic Washer', desc: '초음파 세정 공정' },
      { name: 'Drying Chamber', desc: '건조 공정' },
      { name: 'Surface Vision Process', desc: '세정 품질 검사 공정' },
    ],
  },
  {
    label: 'Final Inspection Unit',
    icon: ShieldCheck,
    processes: [
      { name: 'Final Inspection Process', desc: '최종 검사 공정' },
      { name: 'BMS Test Process', desc: '관리시스템 검사 공정' },
      { name: 'Tray Return Conveyor', desc: '트레이 회수 · 세정 루프' },
    ],
  },
];

const EQUIPMENT_LAYOUT = EQUIPMENT_GROUPS.flatMap((group, groupIndex) =>
  Array.from({ length: 2 }, (_, offset) => {
    const absoluteIndex = groupIndex * 2 + offset;
    const position = absoluteIndex % 2 === 0 ? 'top' : 'bottom';
    const baseColumn = groupIndex * 2 + 1;
    return {
      key: `${group.label}-${offset}`,
      label: group.label,
      icon: group.icon,
      processes: group.processes,
      position,
      gridColumn: `${position === 'top' ? baseColumn : baseColumn + 1}`,
      gridRow: position === 'top' ? '1' : '2',
      lineTypes: ['CL', 'PL', 'CP'],
    };
  }),
);

const tooltipDescription = label => {
  const descriptions = {
    'Tray Dry Cleaning Unit': '트레이 재사용 전 Dry Cleaning 및 버퍼 라인',
    'Electrode Unit': '전극 시트를 생산하고 트레이에 적재하는 공정',
    'Assembly Unit': '셀을 조립하고 전해액을 주입하는 공정',
    'Formation Unit': '충방전 및 Aging으로 셀을 활성화',
    'Module & Pack Unit': '셀을 모듈 · 팩 단계로 조립',
    'Cell Cleaning Unit': '완성 셀을 세정하고 품질을 확인',
    'Final Inspection Unit': '최종 검사 후 트레이 회수 루프',
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
const isEquipmentModalOpen = ref(false);
const activeEquipment = ref(null);

const openEquipmentModal = equipment => {
  activeEquipment.value = equipment;
  isEquipmentModalOpen.value = true;
};

const closeEquipmentModal = () => {
  isEquipmentModalOpen.value = false;
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
  grid-template-columns: repeat(14, minmax(60px, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  column-gap: 0.75rem;
  row-gap: 3.5rem;
  padding: 4rem 1rem 3rem;
  min-height: 320px;
}

.pipeline__rail {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 1rem;
  right: 1rem;
  height: 18px;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(91, 109, 76, 0.45), rgba(91, 109, 76, 0.08));
  box-shadow: inset 0 0 6px rgba(15, 23, 42, 0.1);
}
.pipeline__node {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pipeline__node--top {
  align-self: flex-end;
  margin-bottom: 0.75rem;
}

.pipeline__node--bottom {
  align-self: flex-start;
  margin-top: 0.75rem;
}

.pipeline__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.pipeline__machine {
  width: 78px;
  height: 78px;
  border-radius: 1.25rem;
  background: #e0e7d9;
  border: 2px solid rgba(91, 109, 76, 0.35);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.pipeline__machine:focus-visible {
  outline: 2px solid #5b6d4c;
  outline-offset: 3px;
}

.pipeline__machine:hover {
  transform: scale(1.03);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
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
  margin: 0;
  font-size: 0.72rem;
  text-align: center;
  color: #1f2937;
  font-weight: 600;
}

.pipeline__node[data-position='top'] .pipeline__equip-label {
  order: -1;
}

.pipeline__node[data-position='bottom'] .pipeline__equip-label {
  order: 1;
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

</style>
.process-card__header p {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}
