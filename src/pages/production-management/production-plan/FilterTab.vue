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
          <FilterSelect
            label="공장명"
            v-model="localFilters.factoryName"
            :options="factoryOptions"
          />
          <FilterInput label="품목명" v-model="localFilters.itemName" />
          <FilterInput label="생산담당자" v-model="localFilters.productionManagerName" />
          <FilterInput label="영업담당자" v-model="localFilters.salesManagerName" />
          <FilterInput label="납기일자" type="date" v-model="localFilters.dueDate" />
          <div>
            <Label class="text-xs">생산기간</Label>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <div class="flex-1 min-w-[180px]">
                <FilterInput
                  type="datetime-local"
                  v-model="localFilters.startTime"
                  placeholder="시작일"
                />
              </div>

              <span class="block text-gray-400 w-full lg:w-fit">~</span>

              <div class="flex-1 min-w-[180px]">
                <FilterInput
                  type="datetime-local"
                  v-model="localFilters.endTime"
                  placeholder="종료일"
                />
              </div>
            </div>
          </div>
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
import { computed, reactive } from 'vue';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import FilterInput from '@/components/filter/FilterInput.vue';
import FilterSelect from '@/components/filter/FilterSelect.vue';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const emit = defineEmits(['search']);

const localFilters = reactive({
  factoryName: null,
  itemName: '',
  productionManagerName: '',
  salesManagerName: '',
  dueDate: null,
  startTime: null,
  endTime: null,
});

const applyFilters = () => {
  emit('search', { ...localFilters });
};

const { data: factoryList } = useGetFactoryList();

const factoryOptions = computed(() => {
  if (!factoryList.value || !factoryList.value.content) return [{ value: null, label: '전체' }];

  return [
    { value: null, label: '전체' },
    ...factoryList.value.content.map(factory => ({
      value: factory.factoryName,
      label: factory.factoryName,
    })),
  ];
});

const resetFilters = () => {
  // 초기화하고 바로 조회
  Object.assign(localFilters, {
    factoryName: null,
    salesManagerName: '',
    productionManagerName: '',
    itemName: '',
    dueDate: null,
    startTime: null,
    endTime: null,
  });
  emit('search', { ...localFilters });
};
</script>
