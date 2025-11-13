export const baseManagement = [
  {
    icon: '👤',
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
      { label: '사용자 등록', to: '/base-management/users/new' },
    ],
  },
  {
    icon: '📦',
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
      { label: '품목 등록', to: '/base-management/items/new' },
    ],
  },
  {
    icon: '🏭',
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
      { label: '공장 등록', to: '/base-management/factories/new' },
    ],
  },
  {
    icon: '🔧',
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
      { label: '라인 등록', to: '/base-management/lines/new' },
    ],
  },
  {
    icon: '🧰',
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
      { label: '설비 등록', to: '/base-management/equipments/new' },
    ],
  },
  {
    icon: '⚙️',
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
      { label: '공정 등록', to: '/base-management/processes/new' },
    ],
  },
  { label: '공장 계층 구조도', to: '/base-management/factory-structure' },
];

export const productionManagement = [
  {
    icon: '🗓',
    label: '생산계획 관리',
    children: [
      {
        label: '생산계획 목록 조회',
        to: '/production-management/production-plans',
        children: [
          {
            label: '공정 상세 조회',
            to: '/production-management/production-plans/:documentNo',
          },
        ],
      },
      { label: '생산계획 등록', to: '/production-management/production-plans/new' },
    ],
  },
  {
    icon: '📦',
    label: '생산실적 관리',
    children: [
      {
        label: '생산실적 목록 조회',
        to: '/production-management/production-performances',
        children: [
          {
            label: '공정 상세 조회',
            to: '/production-management/production-performances/:documentNo',
          },
        ],
      },
    ],
  },
  {
    icon: '🚨',
    label: '불량 관리',
    children: [
      {
        label: '불량 목록 조회',
        to: '/production-management/defectives',
        children: [
          {
            label: '공정 상세 조회',
            to: '/production-management/defectives/:documentNo',
          },
        ],
      },
    ],
  },
  {
    icon: '#️⃣',
    label: 'Lot No. 관리',
    children: [
      {
        label: 'Lot No. 목록 조회',
        to: '/production-management/lots',
        children: [
          {
            label: '공정 상세 조회',
            to: '/production-management/lots/:lotNo',
          },
        ],
      },
    ],
  },
];

export const productionReport = [
  { label: '생산 계획 현황', to: '/production-report/production-plans/all' },
  { label: '생산 실적 현황', to: '/production-report/production-performances/all' },
  { label: '불량 현황', to: '/production-report/defectives/all' },
  { label: '로그 현황', to: '/production-report/logs/all' },
];
