import { z } from 'zod'
import { UserSchema } from './user.schema'

export const ReviewSchema = z.object({
  id: z.number(),
  userId: z.number(),
  productId: z.number(),
  orderId: z.number(),
  rating: z.number().min(1).max(5),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const ReviewParamsScheme = z.object({
  reviewId: z.number()
})

export const GetAllReviewsQuerySchema = ReviewSchema.pick({
  productId: true
}).strict()

export const GetReviewWithProductAndOrderQuerySchema = ReviewSchema.pick({
  productId: true,
  orderId: true
}).strict()

export const ReviewDetailSchema = ReviewSchema.extend({
  user: UserSchema.pick({
    id: true,
    name: true,
    email: true,
    avatar: true
  })
})

export const GetAllReviewsResSchema = z.object({
  data: z.array(ReviewDetailSchema),
  totalItems: z.number()
})

export const CreateReviewBodySchema = ReviewSchema.pick({
  productId: true,
  orderId: true,
  rating: true,
  content: true
}).strict()

export const UpdateReviewBodySchema = CreateReviewBodySchema

export type ReviewType = z.infer<typeof ReviewSchema>
export type ReviewParamsType = z.infer<typeof ReviewParamsScheme>
export type GetAllReviewsQueryType = z.infer<typeof GetAllReviewsQuerySchema>
export type GetReviewWithProductAndOrderQueryType = z.infer<typeof GetReviewWithProductAndOrderQuerySchema>
export type ReviewDetailType = z.infer<typeof ReviewDetailSchema>
export type GetAllReviewsResType = z.infer<typeof GetAllReviewsResSchema>
export type CreateReviewBodyType = z.infer<typeof CreateReviewBodySchema>
export type UpdateReviewBodyType = z.infer<typeof UpdateReviewBodySchema>
