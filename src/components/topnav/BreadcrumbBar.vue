<template>
  <Breadcrumb v-if="list.length">
    <BreadcrumbList>
      <template v-for="(item, i) in list" :key="i">
        <BreadcrumbItem>
          <!-- 클릭 가능한 경우 -->
          <BreadcrumbLink
            v-if="item.to && i < list.length - 1"
            as-child
            class="text-muted-foreground hover:text-foreground"
          >
            <RouterLink :to="item.to">
              {{ item.label }}
            </RouterLink>
          </BreadcrumbLink>

          <!-- 클릭 불가 -->
          <span v-else-if="i < list.length - 1" class="text-muted-foreground cursor-default">
            {{ item.label }}
          </span>

          <!-- 현재 페이지 -->
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
