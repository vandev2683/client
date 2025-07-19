export const OrderFee = {
  Delivery: 30000,
  TaxRate: 0.1 // 10%
} as const

export const OrderType = {
  Delivery: 'Delivery',
  DineIn: 'DineIn'
  // Takeaway: 'Takeaway'
} as const

export const OrderStatus = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Preparing: 'Preparing',
  Ready: 'Ready',
  OutForDelivery: 'OutForDelivery',
  Served: 'Served',
  Completed: 'Completed',
  Cancelled: 'Cancelled'
} as const

export const OrderStatusValues = Object.values(OrderStatus)
export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderTypeValues = Object.values(OrderType)
export type OrderTypeType = (typeof OrderType)[keyof typeof OrderType]
