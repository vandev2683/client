import { z } from 'zod'
import { PermissionSchema } from './permission.schema'

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(500),
  description: z.string(),
  isActive: z.coerce.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const RoleParamsSchema = z
  .object({
    roleId: z.coerce.number().int().positive()
  })
  .strict()

export const GetRolesResSchema = z.object({
  data: z.array(RoleSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetAllRolesResSchema = GetRolesResSchema.pick({
  data: true,
  totalItems: true
})

export const GetRoleDetailResSchema = RoleSchema.extend({
  permissions: z.array(
    PermissionSchema.omit({
      createdAt: true,
      updatedAt: true
    })
  )
})

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true
}).strict()

export const UpdateRoleBodySchema = CreateRoleBodySchema.extend({
  permissionIds: z.array(z.number())
}).strict()

export const ChangeRoleStatusBodySchema = RoleSchema.pick({
  isActive: true
}).strict()

export type RoleType = z.infer<typeof RoleSchema>
export type RoleParamsType = z.infer<typeof RoleParamsSchema>
export type GetRolesResType = z.infer<typeof GetRolesResSchema>
export type GetAllRolesResType = z.infer<typeof GetAllRolesResSchema>
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
export type ChangeRoleStatusBodyType = z.infer<typeof ChangeRoleStatusBodySchema>
