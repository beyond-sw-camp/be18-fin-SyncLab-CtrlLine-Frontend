<template>
  <div class="schedule-wrapper">
    <ejs-schedule
      id="Scheduler"
      height="650px"
      :selectedDate="selectedDate"
      currentView="TimelineWeek"
      :eventSettings="eventSettings"
      :group="group"
      :editSettings="editSettings"
      :showCurrentTimeIndicator="true"
      :popupOpen="onPopupOpen"
    >
      <e-views>
        <e-view option="TimelineDay"></e-view>
        <e-view option="TimelineWeek"></e-view>
        <e-view option="TimelineWorkWeek"></e-view>
      </e-views>

      <e-resources>
        <e-resource
          field="factoryCode"
          name="Factories"
          textField="name"
          idField="factoryCode"
          colorField="color"
          :dataSource="data.factories"
        />
        <e-resource
          field="lineCode"
          name="Lines"
          textField="name"
          idField="lineCode"
          groupIDField="factoryCode"
          :dataSource="data.lines"
        />
      </e-resources>
    </ejs-schedule>
  </div>
</template>

<script setup>
import {
  ScheduleComponent as EjsSchedule,
  ViewsDirective as EViews,
  ViewDirective as EView,
  ResourcesDirective as EResources,
  ResourceDirective as EResource,
  TimelineViews,
  TimelineMonth,
  Day,
  Week,
  WorkWeek,
} from '@syncfusion/ej2-vue-schedule';
import { provide } from 'vue';

provide('schedule', [TimelineViews, TimelineMonth, Day, Week, WorkWeek]);

const selectedDate = new Date(2025, 10, 17);

const editSettings = {
  allowAdding: false,
  allowEditing: false,
  allowDeleting: false,
  showDeleteConfirmDialog: false,
  showQuickInfo: false,
};

function onPopupOpen(args) {
  // 1) QuickInfo 팝업
  if (args.type === 'QuickInfo') {
    args.cancel = true;
    return;
  }

  // 2) Event Editor 팝업 (New Event / Edit Event)
  if (args.type === 'Editor') {
    args.cancel = true;
    return;
  }
}

const data = {
  factories: [
    { factoryCode: 'F0001', name: '공장 A', color: '#56ca85' },
    { factoryCode: 'F0002', name: '공장 B', color: '#df5286' },
    { factoryCode: 'F0003', name: '공장 C', color: '#4f5286' },
  ],
  lines: [
    { factoryCode: 'F0001', lineCode: 'PL0001', name: '각형전지생산라인1', color: '#7fa900' },
    { factoryCode: 'F0001', lineCode: 'CL0001', name: '원형전지생산라인1', color: '#ea7a57' },
    { factoryCode: 'F0001', lineCode: 'CPL0001', name: '복합전지생산라인1', color: '#5978ee' },

    { factoryCode: 'F0002', lineCode: 'PL0002', name: '각형전지생산라인2', color: '#7fa900' },
    { factoryCode: 'F0002', lineCode: 'CL0002', name: '원형전지생산라인2', color: '#ea7a57' },
    { factoryCode: 'F0002', lineCode: 'CPL0002', name: '복합전지생산라인2', color: '#5978ee' },

    { factoryCode: 'F0003', lineCode: 'PL0003', name: '각형전지생산라인3', color: '#7fa900' },
    { factoryCode: 'F0003', lineCode: 'CL0003', name: '원형전지생산라인3', color: '#ea7a57' },
    { factoryCode: 'F0003', lineCode: 'CPL0003', name: '복합전지생산라인3', color: '#5978ee' },
  ],
  schedules: [
    /* =======================
     F0001 - PL0001 (각형전지 1)
     ======================= */
    {
      documentNo: 1001,
      factoryCode: 'F0001',
      lineCode: 'PL0001',
      itemName: '각형전지 1-A',
      startTime: '2025-11-17T08:30:00',
      endTime: '2025-11-17T12:00:00',
    },
    {
      documentNo: 1002,
      factoryCode: 'F0001',
      lineCode: 'PL0001',
      itemName: '각형전지 1-B',
      startTime: '2025-11-18T13:00:00',
      endTime: '2025-11-18T16:00:00',
    },
    {
      documentNo: 1003,
      factoryCode: 'F0001',
      lineCode: 'PL0001',
      itemName: '각형전지 1-C',
      startTime: '2025-11-21T09:00:00',
      endTime: '2025-11-21T12:00:00',
    },

    /* =======================
     F0001 - CL0001 (원형전지 1)
     ======================= */
    {
      documentNo: 1101,
      factoryCode: 'F0001',
      lineCode: 'CL0001',
      itemName: '원형전지 1-A',
      startTime: '2025-11-18T07:50:00',
      endTime: '2025-11-18T11:30:00',
    },
    {
      documentNo: 1102,
      factoryCode: 'F0001',
      lineCode: 'CL0001',
      itemName: '원형전지 1-B',
      startTime: '2025-11-20T14:00:00',
      endTime: '2025-11-20T18:00:00',
    },

    /* =======================
     F0001 - CPL0001 (복합전지 1)
     ======================= */
    {
      documentNo: 1201,
      factoryCode: 'F0001',
      lineCode: 'CPL0001',
      itemName: '복합전지 1-A',
      startTime: '2025-11-20T10:00:00',
      endTime: '2025-11-20T16:00:00',
    },
    {
      documentNo: 1202,
      factoryCode: 'F0001',
      lineCode: 'CPL0001',
      itemName: '복합전지 1-B',
      startTime: '2025-11-22T10:00:00',
      endTime: '2025-11-22T13:30:00',
    },

    /* =======================
     F0002 - PL0002 (각형전지 2)
     ======================= */
    {
      documentNo: 2001,
      factoryCode: 'F0002',
      lineCode: 'PL0002',
      itemName: '각형전지 2-A',
      startTime: '2025-11-17T13:00:00',
      endTime: '2025-11-17T18:00:00',
    },
    {
      documentNo: 2002,
      factoryCode: 'F0002',
      lineCode: 'PL0002',
      itemName: '각형전지 2-B',
      startTime: '2025-11-23T07:00:00',
      endTime: '2025-11-23T11:00:00',
    },
    {
      documentNo: 2003,
      factoryCode: 'F0002',
      lineCode: 'PL0002',
      itemName: '각형전지 2-C',
      startTime: '2025-11-25T09:00:00',
      endTime: '2025-11-25T12:00:00',
    },

    /* =======================
     F0002 - CL0002 (원형전지 2)
     ======================= */
    {
      documentNo: 2101,
      factoryCode: 'F0002',
      lineCode: 'CL0002',
      itemName: '원형전지 2-A',
      startTime: '2025-11-19T09:00:00',
      endTime: '2025-11-19T12:00:00',
    },
    {
      documentNo: 2102,
      factoryCode: 'F0002',
      lineCode: 'CL0002',
      itemName: '원형전지 2-B',
      startTime: '2025-11-22T12:30:00',
      endTime: '2025-11-22T15:30:00',
    },

    /* =======================
     F0002 - CPL0002 (복합전지 2)
     ======================= */
    {
      documentNo: 2201,
      factoryCode: 'F0002',
      lineCode: 'CPL0002',
      itemName: '복합전지 2-A',
      startTime: '2025-11-19T13:30:00',
      endTime: '2025-11-19T17:00:00',
    },
    {
      documentNo: 2202,
      factoryCode: 'F0002',
      lineCode: 'CPL0002',
      itemName: '복합전지 2-B',
      startTime: '2025-11-24T10:00:00',
      endTime: '2025-11-24T15:00:00',
    },
    {
      documentNo: 2203,
      factoryCode: 'F0002',
      lineCode: 'CPL0002',
      itemName: '복합전지 2-C',
      startTime: '2025-11-25T12:30:00',
      endTime: '2025-11-25T17:00:00',
    },

    /* =======================
     F0003 - PL0003 (각형전지 3)
     ======================= */
    {
      documentNo: 3001,
      factoryCode: 'F0003',
      lineCode: 'PL0003',
      itemName: '각형전지 3-A',
      startTime: '2025-11-20T09:00:00',
      endTime: '2025-11-20T11:30:00',
    },
    {
      documentNo: 3002,
      factoryCode: 'F0003',
      lineCode: 'PL0003',
      itemName: '각형전지 3-B',
      startTime: '2025-11-23T14:00:00',
      endTime: '2025-11-23T18:00:00',
    },

    /* =======================
     F0003 - CL0003 (원형전지 3)
     ======================= */
    {
      documentNo: 3101,
      factoryCode: 'F0003',
      lineCode: 'CL0003',
      itemName: '원형전지 3-A',
      startTime: '2025-11-21T08:00:00',
      endTime: '2025-11-21T14:00:00',
    },
    {
      documentNo: 3102,
      factoryCode: 'F0003',
      lineCode: 'CL0003',
      itemName: '원형전지 3-B',
      startTime: '2025-11-24T09:00:00',
      endTime: '2025-11-24T13:00:00',
    },

    /* =======================
     F0003 - CPL0003 (복합전지 3)
     ======================= */
    {
      documentNo: 3201,
      factoryCode: 'F0003',
      lineCode: 'CPL0003',
      itemName: '복합전지 3-A',
      startTime: '2025-11-18T13:00:00',
      endTime: '2025-11-18T17:40:00',
    },
    {
      documentNo: 3202,
      factoryCode: 'F0003',
      lineCode: 'CPL0003',
      itemName: '복합전지 3-B',
      startTime: '2025-11-25T09:30:00',
      endTime: '2025-11-25T14:00:00',
    },
  ],
};

const eventSettings = {
  dataSource: data.schedules.map(s => ({
    ...s,
    startTime: new Date(s.startTime),
    endTime: new Date(s.endTime),
  })),
  fields: {
    id: { name: 'documentNo' },
    subject: { name: 'itemName' },
    startTime: { name: 'startTime' },
    endTime: { name: 'endTime' },
  },
};

const group = { resources: ['Factories', 'Lines'] };
</script>

<style></style>
