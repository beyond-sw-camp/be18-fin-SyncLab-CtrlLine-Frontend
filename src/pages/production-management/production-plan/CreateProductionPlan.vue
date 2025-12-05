<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 등록</h3>
    <Button
      type="submit"
      form="productionPlanCreateForm"
      class="bg-primary text-white hover:bg-primary-600 cursor-pointer"
      size="sm"
    >
      Save
    </Button>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <form id="productionPlanCreateForm" @submit="onSubmit" class="flex-1 flex flex-col gap-2">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="order-1 md:order-0">
          <FormField v-slot="{ componentField, errorMessage }" name="factoryCode">
            <FormItem>
              <FormLabel>공장명</FormLabel>
              <FormControl>
                <Select v-bind="componentField" @update:modelValue="onFactorySelected">
                  <SelectTrigger class="w-full truncate min-w-0">
                    <SelectValue placeholder="공장을 선택해주세요." />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem
                      v-for="factory in factoryList?.content ?? []"
                      :key="factory.factoryCode"
                      :value="factory.factoryCode"
                      :data-factory-id="factory.factoryId"
                    >
                      {{ factory.factoryName }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-4 md:order-0">
          <FormField v-slot="{ componentField, errorMessage }" name="dueDate">
            <FormItem>
              <FormLabel>납기일자</FormLabel>
              <FormControl class="w-full truncate min-w-0">
                <Input
                  type="date"
                  v-bind="componentField"
                  autocomplete="due-date"
                  class="text-sm"
                />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-7 md:order-0">
          <FormField name="productionManagerNo" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>
                생산담당자
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><InfoIcon :size="15" /></TooltipTrigger>
                    <TooltipContent side="top">
                      <p>라인 담당자가 생산담당자로 자동 지정됩니다.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl class="w-full truncate min-w-0">
                <div class="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="생산담당자는 자동 지정됩니다."
                    readonly
                    :value="lineDetail?.userName || ''"
                    class="text-sm"
                  />
                  <Input
                    type="text"
                    v-bind="componentField"
                    class="max-w-20 bg-gray-100 text-sm"
                    readonly
                  />
                </div>
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-2 md:order-0">
          <FormField name="itemCode" v-slot="{ value, setValue, errorMessage }">
            <FormItem>
              <FormLabel>품목명</FormLabel>
              <FormControl class="w-full min-w-0">
                <div v-if="selectedFactoryId">
                  <CreateAutoCompleteSelect
                    :key="`autocomplete-${'itemCode'}`"
                    label="품목명"
                    :value="value"
                    :setValue="setValue"
                    :fetchList="() => useGetItemList({ isActive: true })"
                    keyField="itemCode"
                    nameField="itemName"
                    :fields="[
                      'itemCode',
                      'itemName',
                      'itemSpecification',
                      'itemUnit',
                      'itemStatus',
                      'isActive',
                    ]"
                    :tableHeaders="['품목코드', '품목명', '규격', '단위', '품목구분', '사용여부']"
                    :emitFullItem="true"
                    @selectedFullItem="onItemSelected"
                    @clear="onItemCleared"
                  />
                </div>

                <span
                  v-else
                  class="h-9 flex items-center px-3 rounded-md border bg-gray-100 text-gray-400 text-sm"
                >
                  공장을 먼저 선택해주세요.
                </span>
              </FormControl>
              <p class="text-red-500 text-xs">{{ errorMessage }}</p>
            </FormItem>
          </FormField>
        </div>

        <div class="order-5 md:order-0">
          <FormField v-slot="{ componentField, errorMessage }" name="startTime">
            <FormItem class="w-full">
              <FormLabel>생산시작시간</FormLabel>
              <FormControl>
                <Input type="datetime-local" :value="componentField" readonly class="text-sm" />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-8 md:order-0">
          <FormField name="salesManagerNo" v-slot="{ value, setValue, errorMessage }">
            <FormItem class="w-full">
              <FormLabel>영업담당자</FormLabel>
              <FormControl class="w-full min-w-0">
                <CreateAutoCompleteSelect
                  :key="`autocomplete-${'salesManagerNo'}`"
                  label="영업담당자"
                  :value="value"
                  :setValue="setValue"
                  :fetchList="() => useGetUserList({ userStatus: 'ACTIVE' })"
                  keyField="empNo"
                  nameField="userName"
                  :fields="[
                    'empNo',
                    'userName',
                    'userEmail',
                    'userDepartment',
                    'userPhoneNumber',
                    'userStatus',
                    'userRole',
                  ]"
                  :tableHeaders="['사번', '사원명', '이메일', '부서', '연락처', '상태', '권한']"
                />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-3 md:order-0">
          <FormField v-slot="{ componentField, errorMessage }" name="lineCode">
            <FormItem>
              <FormLabel>라인명</FormLabel>
              <FormControl>
                <Select
                  v-if="selectedFactoryId && selectedItemId"
                  v-bind="componentField"
                  :key="`factory-${selectedFactoryId}-item-${selectedItemId}`"
                  @update:modelValue="onLineSelected"
                >
                  <SelectTrigger class="w-full truncate min-w-0">
                    <SelectValue placeholder="라인을 선택해주세요." />
                  </SelectTrigger>

                  <SelectContent>
                    <div
                      v-if="(lineList?.content ?? []).length === 0"
                      class="px-3 py-2 text-sm text-gray-500 select-none"
                    >
                      라인이 존재하지 않습니다.
                    </div>

                    <SelectItem
                      v-for="line in lineList?.content ?? []"
                      :key="line.lineCode"
                      :value="line.lineCode"
                    >
                      {{ line.lineName }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <span
                  v-else
                  class="h-9 flex items-center px-3 rounded-md border bg-gray-100 text-gray-400 text-sm"
                >
                  품목을 먼저 선택해주세요.
                </span>
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-6 md:order-0">
          <FormField v-slot="{ componentField, errorMessage }" name="endTime">
            <FormItem>
              <FormLabel>생산종료시간</FormLabel>
              <FormControl class="w-full">
                <Input type="datetime-local" :value="componentField" disabled class="text-sm" />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-9 md:order-0">
          <FormField v-slot="{ componentField, errorMessage }" name="status">
            <FormItem>
              <FormLabel>상태</FormLabel>
              <FormControl class="w-full">
                <Select v-bind="componentField" disabled>
                  <SelectTrigger class="w-full pointer-events-none">
                    <SelectValue placeholder="상태를 선택하세요." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="(label, value) in PRODUCTION_PLAN_STATUS"
                      :key="value"
                      :value="value"
                    >
                      {{ label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <div class="order-10 md:order-0 col-span-1 md:col-span-3">
          <FormField v-slot="{ componentField, errorMessage }" name="remark">
            <FormItem>
              <FormLabel>비고</FormLabel>
              <FormControl class="w-full">
                <Input type="text" v-bind="componentField" autocomplete="remark" class="text-sm" />
                <p class="text-red-500 text-xs">{{ errorMessage }}</p>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
      </div>
      <ItemTable :itemDetail="itemDetail" />
      <ScheduleData
        :factoryId="selectedFactoryId"
        :factoryCode="factoryDetail?.factoryCode"
        :lineCode="lineDetail?.lineCode"
        mode="create"
      />
    </form>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { InfoIcon } from 'lucide-vue-next';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { z } from 'zod';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import useGetItemList from '@/apis/query-hooks/item/useGetItemList';
import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useCreateProductionPlan from '@/apis/query-hooks/production-plan/useCreateProductionPlan';
import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
import CreateAutoCompleteSelect from '@/components/auto-complete/CreateAutoCompleteSelect.vue';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PRODUCTION_PLAN_STATUS } from '@/constants/enumLabels';
import ItemTable from '@/pages/production-management/production-plan/ItemTable.vue';
import ScheduleData from '@/pages/production-management/production-plan/ScheduleData.vue';
import { useUserStore } from '@/stores/useUserStore';

const formSchema = toTypedSchema(
  z.object({
    factoryCode: z
      .string({ required_error: '공장명은 필수입니다.' })
      .min(1, '공장명은 필수입니다.'),
    dueDate: z.string({ required_error: '납기일자는 필수입니다.' }),
    productionManagerNo: z
      .string({ required_error: '생산담당자는 필수입니다.' })
      .min(1, '생산담당자는 필수입니다.'),
    itemCode: z.string({ required_error: '품목명은 필수입니다.' }).min(1, '품목명은 필수입니다.'),
    salesManagerNo: z.string({ required_error: '영업담당자는 필수입니다.' }),
    lineCode: z.string({ required_error: '라인명은 필수입니다.' }).min(1, '라인명은 필수입니다.'),
    status: z.string({ required_error: '상태는 필수입니다.' }),
    plannedQty: z.coerce
      .number({ required_error: '생산계획수량은 필수입니다.' })
      .positive('생산계획수량은 1 이상이어야 합니다.'),
    remark: z.string().optional(),
  }),
);

const userStore = useUserStore();

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    status: userStore.userRole === 'ADMIN' ? 'CONFIRMED' : 'PENDING',
    plannedQty: 0,
  },
});

const selectedFactoryId = ref(null);
const selectedItemId = ref(null);
const factoryDetail = ref({});
const itemDetail = ref({});
const lineDetail = ref({});

const { data: factoryList } = useGetFactoryList();
const { data: lineList } = useGetLineList({ factoryId: selectedFactoryId, itemId: selectedItemId });
const { mutate: createProductionPlan } = useCreateProductionPlan();

function onFactorySelected(factoryCode) {
  const selected = factoryList.value?.content?.find(f => f.factoryCode === factoryCode);
  selectedFactoryId.value = selected?.factoryId ?? null;
  factoryDetail.value = selected ?? null;

  selectedItemId.value = null;
  form.setFieldValue('itemCode', '', false);
  form.setFieldValue('lineCode', '', false);
  form.setFieldValue('productionManagerNo', '', false);
  itemDetail.value = {};
  lineDetail.value = {};
}

function onItemSelected(item) {
  selectedItemId.value = item.id;
  form.setFieldValue('lineCode', '', false);
  itemDetail.value = item;
}

function onItemCleared() {
  selectedItemId.value = null;
  form.setFieldValue('lineCode', '', false);
  form.setFieldValue('productionManagerNo', '', false);
  itemDetail.value = {};
  lineDetail.value = {};
}

function onLineSelected(lineCode) {
  const selected = lineList.value?.content?.find(f => f.lineCode === lineCode);

  if (selected) {
    lineDetail.value = selected;
    form.setFieldValue('productionManagerNo', selected.empNo, false);
  } else {
    lineDetail.value = {};
    form.setFieldValue('productionManagerNo', '', false);
  }
}

const onSubmit = form.handleSubmit(values => {
  const params = {
    factoryCode: values.factoryCode,
    dueDate: values.dueDate,
    productionManagerNo: values.productionManagerNo,
    itemCode: values.itemCode,
    salesManagerNo: values.salesManagerNo,
    lineCode: values.lineCode,
    status: values.status,
    remark: values.remark,
    plannedQty: values.plannedQty,
  };

  // @ts-ignore
  createProductionPlan(params);
});
</script>

<style scoped></style>
