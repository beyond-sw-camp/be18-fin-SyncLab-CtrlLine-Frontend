<template>
  <Accordion type="single" collapsible>
    <AccordionItem value="filters">
      <div class="flex w-fit px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
        <AccordionTrigger class="p-0 hover:no-underline cursor-pointer">
          Filter by
        </AccordionTrigger>
      </div>

      <AccordionContent class="p-4 border-b-2 border-t-2 my-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilterSelect label="라인명" v-model="localFilters.lineCode" :options="lineOptions" />
          <FilterInput label="담당자" v-model="localFilters.userName" />
          <FilterSelect
            label="담당부서"
            v-model="localFilters.userDepartment"
            :options="[
              { value: null, label: '전체' },
              { value: '영업1팀', label: '영업1팀' },
              { value: '영업2팀', label: '영업2팀' },
              { value: '생산1팀', label: '생산1팀' },
              { value: '생산2팀', label: '생산2팀' },
              { value: '개발1팀', label: '개발1팀' },
              { value: '품질관리팀', label: '품질관리팀' },
              { value: '인사총무팀', label: '인사총무팀' },
            ]"
          />
        </div>

        <div class="flex justify-end mt-4 gap-2">
          <Button
            variant="outline"
            @click="resetFilters"
            size="xs"
            class="text-sm font-normal px-6"
          >
            초기화
          </Button>
          <Button
            class="bg-primary text-white text-sm font-normal px-6"
            @click="applyFilters"
            size="xs"
          >
            조회
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';

import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import FilterInput from '@/components/filter/FilterInput.vue';
import FilterSelect from '@/components/filter/FilterSelect.vue';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const { data: lineList } = useGetLineList();

const lineOptions = computed(() => {
  if (!lineList.value || !lineList.value.content) {
    return [{ value: null, label: '전체' }];
  }

  const entries = lineList.value.content;
  const relevantLines = entries;
  const uniqueLines = new Map();
  for (const line of relevantLines) {
    if (!uniqueLines.has(line.lineCode)) {
      uniqueLines.set(line.lineCode, line);
    }
  }

  const options = Array.from(uniqueLines.values()).map(line => ({
    value: line.lineCode,
    label: `${line.lineName} (${line.lineCode})`,
  }));

  return [{ value: null, label: '전체' }, ...options];
});

const props = defineProps({
  filters: { type: Object, required: true },
});

const emit = defineEmits(['search']);
const localFilters = reactive({
  lineCode: props.filters.lineCode ?? '',
  lineName: props.filters.lineName ?? '',
  userName: props.filters.userName ?? '',
  userDepartment: props.filters.userDepartment ?? null,
});

watch(
  () => props.filters,
  newVal => {
    Object.assign(localFilters, newVal);
  },
  { deep: true },
);

const applyFilters = () => {
  emit('search', { ...localFilters });
};

const resetFilters = () => {
  Object.assign(localFilters, {
    lineCode: '',
    lineName: '',
    userName: '',
    userDepartment: null,
  });
  emit('search', { ...localFilters });
};
</script>
