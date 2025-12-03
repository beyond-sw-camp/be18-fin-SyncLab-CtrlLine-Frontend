<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4">
      <Tabs v-if="factories.length" v-model="selectedFactoryCode" class="w-fit">
        <TabsList class="justify-start">
          <TabsTrigger
            v-for="factory in factories"
            :key="factory.factoryCode"
            :value="factory.factoryCode"
            class="min-w-32"
          >
            {{ factory.factoryName }}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div v-else class="text-sm text-gray-500">공장 목록을 불러오는 중입니다...</div>

      <div class="rounded-xl border border-gray-200 bg-white p-6">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ selectedFactory?.factoryName ?? '공장 계층 구조도' }}
        </h2>
        <p class="mt-2 text-sm text-gray-500">공장 계층 구조도가 이 영역에 표시됩니다.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const { data: factoryList } = useGetFactoryList();

const factories = computed(() => factoryList.value?.content ?? []);
const selectedFactoryCode = ref('');

watch(
  factories,
  list => {
    if (!selectedFactoryCode.value && list.length) {
      selectedFactoryCode.value = list[0].factoryCode;
    }
  },
  { immediate: true },
);

const selectedFactory = computed(() =>
  factories.value.find(factory => factory.factoryCode === selectedFactoryCode.value),
);
</script>
