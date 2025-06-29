export const TableStatus = {
  Available: 'Available',
  Occupied: 'Occupied',
  Reserved: 'Reserved',
  Cleaning: 'Cleaning',
  Disabled: 'Disabled'
} as const

export const TableStatusValues = Object.values(TableStatus)

export type TableStatusType = (typeof TableStatus)[keyof typeof TableStatus]
