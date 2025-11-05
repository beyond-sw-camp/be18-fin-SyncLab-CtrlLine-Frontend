<template>
  <Breadcrumb v-if="list.length">
    <BreadcrumbList>
      <template v-for="(item, i) in list" :key="i">
        <BreadcrumbItem>
          <BreadcrumbLink
            v-if="i < list.length - 1"
            :href="item.to || '#'"
            class="text-muted-foreground hover:text-foreground"
          >
            {{ item.label }}
          </BreadcrumbLink>
          <BreadcrumbPage v-else>{{ item.label }}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="i < list.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup>
import { storeToRefs } from 'pinia';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore';

const { list } = storeToRefs(useBreadcrumbStore());
</script>
