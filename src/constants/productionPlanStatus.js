export const STATUS_CLASSES = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-300',
  RUNNING: 'bg-purple-100 text-purple-700 border-purple-300',
  COMPLETED: 'bg-green-100 text-green-700 border-green-300',
  RETURNED: 'bg-red-100 text-red-700 border-red-300',
};

export const STATUS_COLORS = {
  PENDING: {
    background: '#fef3c7',
    text: '#b45309',
    border: '#fcd34d',
  },
  CONFIRMED: {
    background: '#dbeafe',
    text: '#1d4ed8',
    border: '#93c5fd',
  },
  RUNNING: {
    background: '#f3e8ff',
    text: '#6d28d9',
    border: '#d8b4fe',
  },
  COMPLETED: {
    background: '#d1fae5',
    text: '#047857',
    border: '#6ee7b7',
  },
  RETURNED: {
    background: '#fee2e2',
    text: '#b91c1c',
    border: '#fca5a5',
  },
};

export const DETAIL_HIGHLIGHT = {
  background: 'var(--primary-light)', // #7f9c7a
  border: 'var(--primary)', // #6b8865
  text: 'var(--primary-foreground)', // #ffffff
};
