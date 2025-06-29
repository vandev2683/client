export const PaymentStatus = {
  Pending: 'Pending',
  Succeeded: 'Succeeded',
  Failed: 'Failed',
  Refunded: 'Refunded'
} as const

export const PaymentMethod = {
  Cash: 'Cash',
  MOMO: 'MOMO',
  VNPay: 'VNPay',
  COD: 'COD'
} as const

export const OrderType = {
  Delivery: 'Delivery',
  DineIn: 'DineIn'
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
