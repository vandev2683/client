import { z } from 'zod'

export const CouponSchema = z.object({
  id: z.number(),
  code: z.string().min(1).max(500),
  description: z.string(),
  discountValue: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().nonnegative(),
  usageLimit: z.coerce.number().int().nonnegative(),
  isActive: z.coerce.boolean(),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CouponParamsSchema = z.object({
  couponId: z.coerce.number().int().positive()
})

export const GetCouponsResSchema = z.object({
  data: z.array(CouponSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetAllCouponsResSchema = GetCouponsResSchema.pick({
  data: true,
  totalItems: true
})

export const CreateCouponBodySchema = CouponSchema.pick({
  code: true,
  description: true,
  discountValue: true,
  minOrderAmount: true,
  usageLimit: true,
  isActive: true,
  expiresAt: true
}).strict()

export const UpdateCouponBodySchema = CreateCouponBodySchema

export const ChangeCouponStatusBodySchema = CouponSchema.pick({
  isActive: true
}).strict()

export type CouponType = z.infer<typeof CouponSchema>
export type CouponParamsType = z.infer<typeof CouponParamsSchema>
export type GetCouponsResType = z.infer<typeof GetCouponsResSchema>
export type GetAllCouponsResType = z.infer<typeof GetAllCouponsResSchema>
export type CreateCouponBodyType = z.infer<typeof CreateCouponBodySchema>
export type UpdateCouponBodyType = z.infer<typeof UpdateCouponBodySchema>
export type ChangeCouponStatusBodyType = z.infer<typeof ChangeCouponStatusBodySchema>
