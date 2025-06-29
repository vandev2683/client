import { TagType } from '@/constants/tag'
import { z } from 'zod'

export const TagSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(500),
  type: z.nativeEnum(TagType),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const TagParamsSchema = z.object({
  tagId: z.coerce.number().int().positive()
})

export const GetTagsResSchema = z.object({
  data: z.array(TagSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetAllTagsResSchema = GetTagsResSchema.pick({
  data: true,
  totalItems: true
})

export const CreateTagBodySchema = TagSchema.pick({
  name: true,
  type: true,
  description: true
}).strict()

export const UpdateTagBodySchema = CreateTagBodySchema

export type TagType = z.infer<typeof TagSchema>
export type TagParamsType = z.infer<typeof TagParamsSchema>
export type GetTagsResType = z.infer<typeof GetTagsResSchema>
export type GetAllTagsResType = z.infer<typeof GetAllTagsResSchema>
export type CreateTagBodyType = z.infer<typeof CreateTagBodySchema>
export type UpdateTagBodyType = z.infer<typeof UpdateTagBodySchema>
