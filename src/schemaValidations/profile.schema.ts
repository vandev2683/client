import { z } from 'zod'
import { UserDetailSchema, UserSchema } from './user.schema'
import { OrderDetailSchema } from './order.schema'

export const ProfileSchema = UserDetailSchema

export const ProfileDetailSchema = ProfileSchema.extend({
  orders: z.array(OrderDetailSchema)
})

export const UpdateProfileBodySchema = UserSchema.pick({
  name: true,
  avatar: true,
  phoneNumber: true,
  dateOfBirth: true
}).strict()

export const ChangeProfilePasswordBodySchema = UserSchema.pick({
  password: true
})
  .extend({
    newPassword: z.string().min(3, 'Mật khẩu mới phải có ít nhất 3 ký tự'),
    confirmNewPassword: z.string()
  })
  .strict()
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Xác nhận mật khẩu mới không khớp',
        path: ['confirmNewPassword']
      })
    }
  })

export type ProfileType = z.infer<typeof ProfileSchema>
export type ProfileDetailType = z.infer<typeof ProfileDetailSchema>
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>
export type ChangeProfilePasswordBodyType = z.infer<typeof ChangeProfilePasswordBodySchema>
