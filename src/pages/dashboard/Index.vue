<template>
  <Tabs v-model="currentTab" default-value="scheduler" v-if="factoryList">
    <TabsList>
      <TabsTrigger value="scheduler">전체 일정</TabsTrigger>
      <TabsTrigger
        v-for="factory in factoryList.content"
        :key="factory.factoryCode"
        :value="factory.factoryCode"
      >
        {{ factory.factoryName }}
      </TabsTrigger>
    </TabsList>

    <TabsContent value="scheduler"> <Scheduler /> </TabsContent>
    <TabsContent
      v-for="(factory, index) in factoryList.content"
      :key="factory.factoryCode + '-content'"
      :value="factory.factoryCode"
    >
      <component :is="FACTORY_COMPONENT_LIST[index]" />
    </TabsContent>
  </Tabs>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FirstFactory from '@/pages/dashboard/FirstFactory.vue';
import Scheduler from '@/pages/dashboard/Scheduler.vue';
import SecondFactory from '@/pages/dashboard/SecondFactory.vue';
import ThirdFactory from '@/pages/dashboard/ThirdFactory.vue';

const route = useRoute();
const router = useRouter();

const { data: factoryList } = useGetFactoryList();

const currentTab = ref(route.query.tab ?? 'scheduler');

const FACTORY_COMPONENT_LIST = [FirstFactory, SecondFactory, ThirdFactory];

// 탭이 바뀌면 URL 업데이트
watch(currentTab, value => {
  router.replace({
    query: { tab: value },
  });
});

// URL이 바뀌면 탭도 반영 (뒤로가기 대응)
watch(
  () => route.query.tab,
  value => {
    if (value) currentTab.value = value;
  },
);
</script>
