export const baseManagement = [
  {
    icon: 'UsersIcon',
    label: '사용자 관리',
    children: [
      {
        label: '사용자 목록 조회',
        to: '/base-management/users',
        children: [
          {
            label: '사용자 상세 조회',
            to: '/base-management/users/:userId',
          },
        ],
      },
      { label: '사용자 등록', to: '/base-management/users/new', role: 'ADMIN' },
    ],
  },
  {
    icon: 'PackageIcon',
    label: '품목 관리',
    children: [
      {
        label: '품목 목록 조회',
        to: '/base-management/items',
        children: [
          {
            label: '품목 상세 조회',
            to: '/base-management/items/:itemCode',
          },
        ],
      },
      { label: '품목 등록', to: '/base-management/items/new', role: 'ADMIN' },
    ],
  },
  {
    icon: 'FactoryIcon',
    label: '공장 관리',
    children: [
      {
        label: '공장 목록 조회',
        to: '/base-management/factories',
        children: [
          {
            label: '공정 상세 조회',
            to: '/base-management/factories/:factoryCode',
          },
        ],
      },
    ],
  },
  {
    icon: 'Grid3x2Icon',
    label: '라인 관리',
    children: [
      {
        label: '라인 목록 조회',
        to: '/base-management/lines',
        children: [
          {
            label: '라인 상세 조회',
            to: '/base-management/lines/:lineCode',
          },
        ],
      },
    ],
  },
  {
    icon: 'CableIcon',
    label: '설비 관리',
    children: [
      {
        label: '설비 목록 조회',
        to: '/base-management/equipments',
        children: [
          {
            label: '설비 상세 조회',
            to: '/base-management/equipments/:equipmentCode',
          },
        ],
      },
    ],
  },
  {
    icon: 'MicrochipIcon',
    label: '공정 관리',
    children: [
      {
        label: '공정 목록 조회',
        to: '/base-management/processes',
        children: [
          {
            label: '공정 상세 조회',
            to: '/base-management/processes/:processesCode',
          },
        ],
      },
    ],
  },
  { icon: 'LayersIcon', label: '공장 계층 구조도', to: '/base-management/factory-structure' },
];

export const productionManagement = [
  {
    icon: 'SquareChartGanttIcon',
    label: '생산계획 관리',
    children: [
      {
        label: '생산계획 목록 조회',
        to: '/production-management/production-plans',
        children: [
          {
            label: '생산계획 상세 조회',
            to: '/production-management/production-plans/:documentNo',
          },
        ],
      },
      { label: '생산계획 등록', to: '/production-management/production-plans/new' },
    ],
  },
  {
    icon: 'ChartNoAxesCombinedIcon',
    label: '생산실적 관리',
    children: [
      {
        label: '생산실적 목록 조회',
        to: '/production-management/production-performances',
        children: [
          {
            label: '생산실적 상세 조회',
            to: '/production-management/production-performances/:documentNo',
          },
        ],
      },
    ],
  },
  {
    icon: 'BugIcon',
    label: '불량 관리',
    children: [
      {
        label: '불량 목록 조회',
        to: '/production-management/defectives',
        children: [
          {
            label: '불량 상세 조회',
            to: '/production-management/defectives/:documentNo',
          },
        ],
      },
    ],
  },
  {
    icon: 'QrCodeIcon',
    label: 'Lot No. 관리',
    children: [
      {
        label: 'Lot No. 목록 조회',
        to: '/production-management/lots',
        children: [
          {
            label: 'Lot No. 상세 조회',
            to: '/production-management/lots/:lotId',
          },
        ],
      },
    ],
  },
];

export const productionReport = [
  {
    icon: 'ClipboardMinus',
    label: '생산계획 현황',
    to: '/production-report/production-plans/all',
    admin: false,
  },
  {
    icon: 'FileChartLine',
    label: '생산실적 현황',
    to: '/production-report/production-performances/all',
    admin: false,
  },
  { icon: 'BugPlay', label: '불량 현황', to: '/production-report/defectives/all', admin: false },
  { icon: 'FileClock', label: '로그 현황', to: '/production-report/logs/all', admin: true },
];
