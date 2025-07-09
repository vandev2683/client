import { OrderStatus, OrderType } from '@/constants/order'
import { PaymentMethod, PaymentStatus } from '@/constants/payment'
import { z } from 'zod'
import { PaymentSchema } from './payment.schema'
import { CartItemDetailSchema } from './cart.schema'

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
  feeAmount: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  finalAmount: z.number().positive(),
  payment: PaymentSchema,
  note: z.string().default(''),
  status: z.nativeEnum(OrderStatus),
  handlerId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const OrderItemSchema = z.object({
  id: z.number(),
  productName: z.string(),
  thumbnail: z.string().optional(),
  variantValue: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  orderId: z.number().int(),
  productId: z.number().int().nullable(),
  variantId: z.number().int().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateOnlineOrderBodySchema = OrderSchema.pick({
  deliveryAddressId: true,
  couponId: true,
  note: true
})
  .extend({
    paymentMethod: z.nativeEnum(PaymentMethod),
    cartItems: z.array(CartItemDetailSchema).min(1, 'Đơn hàng phải có ít nhất một sản phẩm')
  })
  .strict()

export const CreateOrderResSchema = z.object({
  message: z.string(),
  paymentUrl: z.string().optional()
})

export type OrderItemType = z.infer<typeof OrderItemSchema>
export type CreateOnlineOrderBodyType = z.infer<typeof CreateOnlineOrderBodySchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>
