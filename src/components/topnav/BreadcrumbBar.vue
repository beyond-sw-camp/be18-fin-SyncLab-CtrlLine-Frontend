<template>
  <Breadcrumb v-if="list.length">
    <BreadcrumbList>
      <template v-for="(item, i) in list" :key="i">
        <BreadcrumbItem>
          <BreadcrumbLink
            v-if="i < list.length - 1"
            as-child
            class="text-muted-foreground hover:text-foreground"
          >
            <RouterLink :to="item.to || '#'">
              {{ item.label }}
            </RouterLink>
          </BreadcrumbLink>
          <BreadcrumbPage v-else class="font-semibold text-foreground">
            {{ item.label }}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="i < list.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

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
