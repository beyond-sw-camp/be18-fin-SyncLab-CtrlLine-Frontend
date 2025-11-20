<template>
  <Card class="flex justify-center items-center">
    <CardContent>
      <div class="flex gap-20">
        <div>
          <span class="text-sm">{{ temperature }}도</span>
          <div class="h-[200px] w-6 bg-gray-200 rounded-full relative overflow-hidden">
            <div
              class="absolute bottom-0 w-full bg-red-500 rounded-full"
              :style="{ height: `${temperature}%` }"
            ></div>
          </div>
        </div>
        <div>
          <span class="text-sm">{{ humidity }}%</span>
          <div class="h-[200px] w-6 bg-gray-200 rounded-full relative overflow-hidden">
            <div
              class="absolute bottom-0 w-full bg-sky-300 rounded-full"
              :style="{ height: `${humidity}%` }"
            ></div>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter class="flex text-sm gap-20 mt-auto">
      <div>온도</div>
      <div>습도</div>
    </CardFooter>
  </Card>
</template>

<script setup>
import { Card, CardContent, CardFooter } from '@/components/ui/card';

defineProps({
  temperature: Number,
  humidity: Number,
});
</script>
