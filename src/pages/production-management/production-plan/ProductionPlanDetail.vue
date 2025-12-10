<template>
  <div class="flex justify-between items-center mb-6">
    <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">생산계획 상세 조회</h3>
    <div class="flex gap-2">
      <Badge v-if="productionPlanDetail" variant="secondary">
        {{ productionPlanDetail.planDocumentNo }}</Badge
      >

      <Button
        v-if="canDelete"
        variant="outline"
        size="sm"
        class="cursor-pointer w-[60px]"
        @click="deleteProductionPlan(productionPlanDetail.id)"
      >
        Delete
      </Button>
      <Button
        v-if="canEdit"
        type="submit"
        form="productionPlanUpdateForm"
        class="bg-primary text-white hover:bg-primary-600 cursor-pointer w-[60px]"
        size="sm"
      >
        Save
      </Button>
    </div>
  </div>

  <div class="flex flex-col gap-8 md:flex-row">
    <fieldset :disabled="isFormDisabled">
      <form
        v-if="productionPlanDetail"
        id="productionPlanUpdateForm"
        @submit="onSubmit"
        class="flex-1 flex flex-col gap-2"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div class="order-1 md:order-0">
            <FormField v-slot="{ componentField, errorMessage }" name="factoryCode">
              <FormItem>
                <FormLabel>공장</FormLabel>
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
            <FormField
              name="productionManagerNo"
              v-slot="{ value, componentField, setValue, errorMessage }"
            >
              <FormItem class="w-full">
                <FormLabel>생산 담당자</FormLabel>
                <FormControl class="w-full min-w-0">
                  <UpdateAutoCompleteSelect
                    :key="`productionManagerNo-${productionPlanDetail?.productionManagerNo}`"
                    label="생산 담당자"
                    :value="value"
                    :componentField="componentField"
                    :setValue="setValue"
                    :fetchList="
                      () => useGetUserList({ userStatus: 'ACTIVE', userDepartment: '생산' })
                    "
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
                    :initialText="productionPlanDetail.productionManagerName"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-2 md:order-0">
            <FormField name="itemCode" v-slot="{ value, componentField, setValue, errorMessage }">
              <FormItem>
                <FormLabel>품목</FormLabel>
                <FormControl class="w-full min-w-0">
                  <div v-if="selectedFactoryId">
                    <UpdateAutoCompleteSelect
                      :key="`itemCode-${productionPlanDetail?.itemCode}`"
                      label="품목"
                      :value="value"
                      :componentField="componentField"
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
                      :initialText="productionPlanDetail.itemName"
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
                <FormLabel>생산 시작 시각</FormLabel>
                <FormControl>
                  <Input type="datetime-local" v-bind="componentField" class="text-sm" readonly />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-8 md:order-0">
            <FormField
              name="salesManagerNo"
              v-slot="{ value, componentField, setValue, errorMessage }"
            >
              <FormItem class="w-full">
                <FormLabel>영업 담당자</FormLabel>
                <FormControl class="w-full min-w-0">
                  <UpdateAutoCompleteSelect
                    :key="`salesManagerNo-${productionPlanDetail?.salesManagerNo}`"
                    label="영업 담당자"
                    :value="value"
                    :componentField="componentField"
                    :setValue="setValue"
                    :fetchList="
                      () => useGetUserList({ userStatus: 'ACTIVE', userDepartment: '영업' })
                    "
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
                    :initialText="productionPlanDetail.salesManagerName"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>

          <div class="order-3 md:order-0">
            <FormField v-slot="{ componentField, errorMessage }" name="lineCode">
              <FormItem>
                <FormLabel>라인</FormLabel>
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
                <FormLabel>생산 종료 시각</FormLabel>
                <FormControl class="w-full">
                  <Input type="datetime-local" v-bind="componentField" disabled class="text-sm" />
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
                  <Select v-bind="componentField">
                    <SelectTrigger :class="['w-full', canEdit ? '' : 'pointer-events-none']">
                      <SelectValue placeholder="상태를 선택하세요." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="(label, value) in PRODUCTION_PLAN_STATUS"
                        :key="value"
                        :value="value"
                        :disabled="shouldDisableStatus(value)"
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
                  <Input
                    type="text"
                    v-bind="componentField"
                    autocomplete="remark"
                    class="text-sm"
                  />
                  <p class="text-red-500 text-xs">{{ errorMessage }}</p>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
        </div>
        <ItemTable :itemDetail="itemDetail" />
        <ScheduleData
          v-if="
            productionPlanDetail && selectedFactoryId && selectedItemId && lineList?.content?.length
          "
          :productionPlanDetailId="productionPlanDetail.id"
          :factoryId="selectedFactoryId"
          :factoryCode="productionPlanDetail.factoryCode"
          :lineCode="productionPlanDetail.lineCode"
          mode="detail"
          @updateStartEndTime="onStartTimeEndTimeChanged"
          :updatedStartTime="form.values.startTime"
          :updatedEndTime="form.values.endTime"
        />
      </form>
    </fieldset>
  </div>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod';
import { useDebounceFn } from '@vueuse/core';
import { useForm } from 'vee-validate';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { z } from 'zod';

import useGetFactoryList from '@/apis/query-hooks/factory/useGetFactoryList';
import useGetItemList from '@/apis/query-hooks/item/useGetItemList';
import useGetLineList from '@/apis/query-hooks/line/useGetLineList';
import useCreateProductionPlanEndTime from '@/apis/query-hooks/production-plan/useCreateProductionPlanEndTime';
import useDeleteProductionPlan from '@/apis/query-hooks/production-plan/useDeleteProductionPlan';
import useGetProductionPlan from '@/apis/query-hooks/production-plan/useGetProductionPlan';
import useUpdateProductionPlan from '@/apis/query-hooks/production-plan/useUpdateProductionPlan';
import useGetUserList from '@/apis/query-hooks/user/useGetUserList';
import UpdateAutoCompleteSelect from '@/components/auto-complete/UpdateAutoCompleteSelect.vue';
import { Badge } from '@/components/ui/badge';
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
import { PRODUCTION_PLAN_STATUS } from '@/constants/enumLabels';
import ItemTable from '@/pages/production-management/production-plan/ItemTable.vue';
import ScheduleData from '@/pages/production-management/production-plan/ScheduleData.vue';
import { useUserStore } from '@/stores/useUserStore';
import formatDate from '@/utils/formatDate';

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
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
);

const route = useRoute();
const { data: productionPlanDetail } = useGetProductionPlan(route.params.productionPlanId);
const { mutate: deleteProductionPlan } = useDeleteProductionPlan();

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    factoryCode: productionPlanDetail.value?.factoryCode,
    dueDate: productionPlanDetail.value?.dueDate,
    productionManagerNo: productionPlanDetail.value?.productionManagerNo,
    itemCode: productionPlanDetail.value?.itemCode,
    salesManagerNo: productionPlanDetail.value?.salesManagerNo,
    lineCode: productionPlanDetail.value?.lineCode,
    status: productionPlanDetail.value?.status,
    plannedQty: productionPlanDetail.value?.plannedQty,
    startTime: productionPlanDetail.value?.startTime,
    endTime: productionPlanDetail.value?.endTime,
    remark: productionPlanDetail.value?.remark,
  },
});

const selectedFactoryId = ref(null);
const selectedItemId = ref(null);
const itemDetail = ref({});
const lineDetail = ref({});
const userStore = useUserStore();

const isAdmin = computed(() => userStore.userRole === 'ADMIN');

const isFormDisabled = computed(() => {
  const status = productionPlanDetail.value?.status;

  if (!status) return true; // 상태값이 없으면 기본적으로 비활성화(안전 조치)

  // RUNNING, COMPLETED, RETURNED 상태일 때는 입력값 전체를 비활성화 (disabled) 처리
  if (['RUNNING', 'COMPLETED', 'RETURNED'].includes(status)) {
    return true;
  }

  // 그 외의 상태 (PENDING, CONFIRMED 등)에서는 활성화
  return false;
});

const canEdit = computed(() => {
  const role = userStore.userRole;
  const status = productionPlanDetail.value?.status;

  if (!status || !role) return false;

  // RUNNING, COMPLETED 은 누구든 수정 불가
  if (['RUNNING', 'COMPLETED'].includes(status)) return false;

  // ADMIN: PENDING, CONFIRMED 에서만 수정 가능
  if (role === 'ADMIN') {
    return ['PENDING', 'CONFIRMED'].includes(status);
  }

  // MANAGER, USER: PENDING 에서만 수정 가능
  if (role === 'MANAGER' || role === 'USER') {
    return status === 'PENDING';
  }

  // 혹시 모를 기타 롤은 모두 불가
  return false;
});

const canDelete = computed(() => {
  const role = userStore.userRole;
  const status = productionPlanDetail.value?.status;
  const userEmpNo = userStore.empNo;
  const pmNo = productionPlanDetail.value?.productionManagerNo;

  if (!status || !role) return false;

  // RUNNING, COMPLETED 은 누구든 삭제 불가
  if (['RUNNING', 'COMPLETED'].includes(status)) return false;

  // ADMIN: RUNNING, COMPLETED, RETURNED 제외 모두 삭제 가능
  if (role === 'ADMIN') {
    return ['PENDING', 'CONFIRMED'].includes(status);
  }

  // MANAGER: 자기 자신 것만 삭제 가능 (PENDING, CONFIRMED 만)
  if (role === 'MANAGER') {
    return userEmpNo === pmNo && ['PENDING', 'CONFIRMED'].includes(status);
  }

  // USER: 삭제 불가
  return false;
});

const shouldDisableStatus = value => {
  // RUNNING, COMPLETED → 모든 사용자 비활성화
  if (['RUNNING', 'COMPLETED'].includes(value)) return true;

  // CONFIRMED → ADMIN만 선택 가능
  if (value === 'CONFIRMED' && !isAdmin.value) return true;

  // 나머지는 모든 사용자 선택 가능
  return false;
};

const { data: factoryList } = useGetFactoryList();
const { data: lineList } = useGetLineList({ factoryId: selectedFactoryId, itemId: selectedItemId });
const { mutate: updateProductionPlan } = useUpdateProductionPlan(route.params.productionPlanId);
const { mutate: updateEndTime } = useCreateProductionPlanEndTime();

function onFactorySelected(factoryCode) {
  const selected = factoryList.value?.content?.find(f => f.factoryCode === factoryCode);
  selectedFactoryId.value = selected?.factoryId ?? null;

  selectedItemId.value = null;
  form.setFieldValue('itemCode', '', false);
  form.setFieldValue('lineCode', '', false);
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
  itemDetail.value = {};
  lineDetail.value = {};
}

function onLineSelected(lineCode) {
  const selected = lineList.value?.content?.find(f => f.lineCode === lineCode);

  if (selected) {
    lineDetail.value = selected;
  } else {
    lineDetail.value = {};
  }
}

function onStartTimeEndTimeChanged(ev) {
  const start = formatDate(ev.StartTime, 'local-datetime');
  form.setFieldValue('startTime', start);
}

const onSubmit = form.handleSubmit(values => {
  const params = {
    status: values.status,
    salesManagerNo: values.salesManagerNo,
    productionManagerNo: values.productionManagerNo,
    startTime: values.startTime,
    plannedQty: values.plannedQty,
    remark: values.remark,
    factoryCode: values.factoryCode,
    itemCode: values.itemCode,
    lineCode: values.lineCode,
    dueDate: values.dueDate,
  };

  updateProductionPlan(params);
});

const debouncedUpdateEndTime = useDebounceFn(({ startTime, plannedQty, lineCode }) => {
  updateEndTime(
    // @ts-ignore
    { startTime, plannedQty, lineCode },
    {
      onSuccess: data => {
        if (!data) return;
        form.setFieldValue('endTime', data.endTime, false);
      },
    },
  );
}, 400);

watch([() => form.values.startTime, () => form.values.plannedQty], ([startTime, plannedQty]) => {
  const formattedStartTime = formatDate(startTime, 'local-datetime');

  if (!startTime || !plannedQty || !lineDetail.value?.lineCode || !formattedStartTime) return;

  debouncedUpdateEndTime({
    startTime: formattedStartTime,
    plannedQty,
    lineCode: lineDetail.value.lineCode,
  });
});

watch(
  () => productionPlanDetail.value,
  val => {
    if (!val) return;

    form.setValues({
      factoryCode: val.factoryCode,
      dueDate: val.dueDate,
      productionManagerNo: val.productionManagerNo,
      itemCode: val.itemCode,
      salesManagerNo: val.salesManagerNo,
      lineCode: val.lineCode,
      status: val.status,
      plannedQty: val.plannedQty,
      startTime: val.startTime,
      endTime: val.endTime,
      remark: val.remark,
    });

    // 실제 백엔드 응답으로 변경 필요
    selectedFactoryId.value = val.factoryId;
    selectedItemId.value = val.itemId;

    itemDetail.value = {
      itemCode: val.itemCode,
      itemName: val.itemName,
      itemSpecification: val.itemSpecification, // 상세 응답에 있으면 그대로
      itemUnit: val.itemUnit, // 상세 응답에 있으면 그대로
    };

    lineDetail.value = {
      lineCode: val.lineCode,
      lineName: val.lineName,
      userName: val.productionManagerName, // 생산담당자명 표시
    };
  },
  { immediate: true },
);
</script>

<style scoped></style>
