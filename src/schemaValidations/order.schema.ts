import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@/constants/order'
import { z } from 'zod'

export const PaymentSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.Pending),
  paidAt: z.date().nullable().default(null),
  transactionId: z.string().trim().default('')
})

export type PaymentType = z.infer<typeof PaymentSchema>

// Order item schema for creating orders
export const OrderItemInputSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive()
})

// Base schema for order data
export const OrderSchema = z.object({
  id: z.number(),
  orderType: z.nativeEnum(OrderType),
  customerName: z.string().max(500).default(''),
  userId: z.number().nullable(),
  deliveryAddressId: z.number().nullable(),
  tableId: z.number().nullable(),
  bookingId: z.number().nullable(),
  couponId: z.number().nullable(),
  totalAmount: z.number().positive(),
  discountAmount: z.number().nonnegative().default(0),
  finalAmount: z.number().positive(),
  payment: PaymentSchema,
  note: z.string().default(''),
  status: z.nativeEnum(OrderStatus),
  handlerId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})
