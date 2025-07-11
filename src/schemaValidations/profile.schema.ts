import { z } from 'zod'
import { UserSchema } from './user.schema'
import { RoleSchema } from './role.schema'
import { GetOrderDetailResSchema } from './order.schema'

export const ProfileSchema = UserSchema.omit({
  password: true,
  totpSecret: true
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true
  })
})

export const GetOrdersProfileResSchema = z.object({
  data: z.array(GetOrderDetailResSchema),
  totalItems: z.number()
})

export const UpdateProfileBodySchema = UserSchema.pick({
  name: true,
  avatar: true,
  phoneNumber: true,
  dateOfBirth: true
}).strict()

export const ChangePasswordBodySchema = UserSchema.pick({
  password: true
})
  .extend({
    newPassword: z.string().min(3),
    confirmNewPassword: z.string()
  })
  .strict()
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New password and confirm new password must match',
        path: ['confirmNewPassword']
      })
    }
  })

export type ProfileType = z.infer<typeof ProfileSchema>
export type GetOrdersProfileResType = z.infer<typeof GetOrdersProfileResSchema>
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
