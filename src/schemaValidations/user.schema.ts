import { UserStatus } from '@/constants/user'
import { z } from 'zod'
import { RoleSchema } from './role.schema'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email().max(500),
  password: z.string().min(3).max(500),
  roleId: z.coerce.number(),
  name: z.string().max(500),
  phoneNumber: z.string().max(50),
  avatar: z.string().max(1000).nullable(),
  dateOfBirth: z.coerce.date().nullable(),
  totpSecret: z.string().max(1000).nullable(),
  status: z.nativeEnum(UserStatus),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const UserWithRoleSchema = UserSchema.extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
    isActive: true
  })
})

export const UserParamsSchema = z.object({
  userId: z.coerce.number().int().positive()
})

export const GetUsersResSchema = z.object({
  data: z.array(UserWithRoleSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetAllUsersResSchema = GetUsersResSchema.pick({
  data: true,
  totalItems: true
})

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  dateOfBirth: true,
  status: true,
  roleId: true
}).strict()

export const UpdateUserBodySchema = CreateUserBodySchema.omit({
  email: true,
  password: true
}).strict()

export const ChangePasswordBodySchema = UserSchema.pick({
  password: true
}).strict()

export const ChangeUserStatusBodySchema = UserSchema.pick({
  status: true
}).strict()

export type UserType = z.infer<typeof UserSchema>
export type UserWithRoleType = z.infer<typeof UserWithRoleSchema>
export type UserParamsType = z.infer<typeof UserParamsSchema>
export type GetUsersResType = z.infer<typeof GetUsersResSchema>
export type GetAllUsersResType = z.infer<typeof GetAllUsersResSchema>
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
export type ChangeUserStatusBodyType = z.infer<typeof ChangeUserStatusBodySchema>
