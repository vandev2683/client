import { PaymentMethod, PaymentStatus } from '@/constants/payment'
import { z } from 'zod'

export const PaymentSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.Pending),
  paidAt: z.date().nullable().default(null),
  transactionId: z.string().trim().default('')
})

export type PaymentType = z.infer<typeof PaymentSchema>
