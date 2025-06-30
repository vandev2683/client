import { ProductStatus } from '@/constants/product'
import { z } from 'zod'
import { PaginationQuerySchema } from './request.schema'
import { OrderBy, SortBy } from '@/constants/common'
import { CategorySchema } from './category.schema'
import { TagSchema } from './tag.schema'

export const ProductVariantSchema = z.object({
  type: z.string().trim(),
  options: z.array(z.string().trim())
})

export const ProductVariantsSchema = z.array(ProductVariantSchema)
// .superRefine((variants, ctx) => {
//   for (let i = 0; i < variants.length; i++) {
//     const variant = variants[i]
//     // Kiểm tra các type có trùng lặp
//     const typeIndex = variants.findIndex((v) => v.type.toLowerCase() === variant.type.toLowerCase())
//     if (typeIndex !== i) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: `Type "${variant.type}" is duplicated. Please ensure each type is unique.`,
//         path: ['options']
//       })
//     }

//     // Kiểm tra các options của type có trùng lặp
//     const isDuplicateOption = variant.options.some((option, index) => {
//       return variant.options.findIndex((o) => o.toLowerCase() === option.toLowerCase()) !== index
//     })
//     if (isDuplicateOption) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: `Options for type "${variant.type}" contain duplicates. Please ensure each option is unique.`,
//         path: ['options']
//       })
//     }
//   }
// })

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(1000),
  basePrice: z.number().nonnegative(),
  description: z.string(),
  images: z.array(z.string()),
  status: z.nativeEnum(ProductStatus),
  variantsConfig: ProductVariantsSchema,
  createdAt: z.date(),
  updatedAt: z.date()
})

export const VariantSchema = z.object({
  id: z.number(),
  productId: z.number(),
  value: z.string().trim().min(1).max(1000),
  thumbnail: z.string().nullable(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export function generateVariants(variants: ProductVariantsType) {
  // Hàm hỗ trợ để tạo tất cả tổ hợp
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? ' / ' : ''}${y}`)), [''])
  }

  // Lấy mảng các options từ variants
  const options = variants.map((variant) => variant.options)

  // Tạo tất cả tổ hợp
  const combinations = getCombinations(options)

  // Chuyển tổ hợp thành SKU objects
  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 0,
    thumbnail: null
  }))
}

export const ProductParamsSchema = z.object({
  productId: z.coerce.number().int().positive()
})

export const ProductQuerySchema = PaginationQuerySchema.extend({
  name: z.string().trim().optional(),
  categories: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return [Number(value)]
      }
      return value
    }, z.array(z.coerce.number().int().positive()))
    .optional(),
  tags: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return [Number(value)]
      }
      return value
    }, z.array(z.coerce.number().int().positive()))
    .optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  orderBy: z.nativeEnum(OrderBy).default(OrderBy.Desc),
  sortBy: z.nativeEnum(SortBy).default(SortBy.CreatedAt)
})

export const GetProductsResSchema = z.object({
  data: z.array(ProductSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetAllProductsResSchema = GetProductsResSchema.pick({
  data: true,
  totalItems: true
})

export const GetProductDetailResSchema = ProductSchema.extend({
  variants: z.array(VariantSchema),
  categories: z.array(CategorySchema),
  tags: z.array(TagSchema)
})

export const UpsertVariantBodySchema = VariantSchema.pick({
  value: true,
  price: true,
  stock: true,
  thumbnail: true
})

export const CreateProductBodySchema = ProductSchema.pick({
  name: true,
  description: true,
  images: true,
  status: true,
  variantsConfig: true
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()).optional(),
    tags: z.array(z.coerce.number().int().positive()).optional(),
    variants: z.array(UpsertVariantBodySchema)
  })
  .strict()
  .superRefine(({ variantsConfig, variants }, ctx) => {
    for (let i = 0; i < variantsConfig.length; i++) {
      const variant = variantsConfig[i]
      // Kiểm tra các type có trùng lặp
      const typeIndex = variantsConfig.findIndex((v) => v.type.toLowerCase() === variant.type.toLowerCase())
      if (typeIndex !== i) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Type "${variant.type}" is duplicated. Please ensure each type is unique.`,
          path: ['variantsConfig']
        })
      }

      // Kiểm tra các options của type có trùng lặp
      const isDuplicateOption = variant.options.some((option, index) => {
        return variant.options.findIndex((o) => o.toLowerCase() === option.toLowerCase()) !== index
      })
      if (isDuplicateOption) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Options for type "${variant.type}" contain duplicates. Please ensure each option is unique.`,
          path: ['variantsConfig']
        })
      }
    }
    const variantValues = generateVariants(variantsConfig)
    const allVariants = [
      ...variants,
      ...variantValues.filter((variant) => !variants.some((v) => v.value === variant.value))
    ]
    // Kiểm tra xem kích thước của variants có khớp với variantsConfig không
    // if (allVariants.length !== variants.length) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: `The number of variants (${variants.length}) does not match. Please check again.`,
    //     path: ['variants']
    //   })
    // }

    // Kiểm tra xem các giá trị của variants có khớp với variantsConfig không

    for (let i = 0; i < variants.length; i++) {
      const isValid = variants[i].value === allVariants[i].value || variants[i].value === 'default'
      if (variants[i].value === 'default') {
        variantsConfig[0].type = 'default'
        variantsConfig[0].options = ['default']
      }
      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Variant value "${variants[i].value}" does not match the expected value "${allVariants[i].value}". Please check again.`,
          path: ['variants']
        })
      }
    }
  })

export const UpdateProductBodySchema = CreateProductBodySchema

export const ChangeProductStatusBodySchema = ProductSchema.pick({
  status: true
}).strict()

export type ProductVariantType = z.infer<typeof ProductVariantSchema>
export type ProductVariantsType = z.infer<typeof ProductVariantsSchema>
export type ProductType = z.infer<typeof ProductSchema>
export type VariantType = z.infer<typeof VariantSchema>
export type ProductParamsType = z.infer<typeof ProductParamsSchema>
export type ProductQueryType = z.infer<typeof ProductQuerySchema>
export type GetProductsResType = z.infer<typeof GetProductsResSchema>
export type GetAllProductsResType = z.infer<typeof GetAllProductsResSchema>
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>
export type UpsertVariantBodyType = z.infer<typeof UpsertVariantBodySchema>
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>
export type ChangeProductStatusBodyType = z.infer<typeof ChangeProductStatusBodySchema>
