import { z } from 'zod'
import { ProductSchema, VariantSchema } from './product.schema'

export const CartItemSchema = z.object({
  id: z.number(),
  variantId: z.number(),
  userId: z.number(),
  quantity: z.number().int().positive().min(1),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CartItemDetailSchema = CartItemSchema.extend({
  variant: VariantSchema.omit({
    createdAt: true,
    updatedAt: true
  }).extend({
    product: ProductSchema.omit({
      createdAt: true,
      updatedAt: true
    })
  })
})

export const ExtendedCartItemSchema = CartItemDetailSchema.extend({
  checked: z.boolean(),
  disabled: z.boolean()
})

export const CartItemParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive()
})

export const GetAllCartItemsResSchema = z.object({
  data: z.array(CartItemDetailSchema),
  totalItems: z.number()
})

export const CreateCartItemBodySchema = CartItemSchema.pick({
  variantId: true,
  quantity: true
}).strict()

export const UpdateCartItemBodySchema = CreateCartItemBodySchema

export const DeleteCartItemBodySchema = z
  .object({
    cartItemIds: z.array(z.coerce.number().int().positive())
  })
  .strict()

export type CartItemType = z.infer<typeof CartItemSchema>
export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>
export type ExtendedCartItemType = z.infer<typeof ExtendedCartItemSchema>
export type CartItemParamsType = z.infer<typeof CartItemParamsSchema>
export type GetAllCartItemsResType = z.infer<typeof GetAllCartItemsResSchema>
export type CreateCartItemBodyType = z.infer<typeof CreateCartItemBodySchema>
export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>
export type DeleteCartItemBodyType = z.infer<typeof DeleteCartItemBodySchema>
