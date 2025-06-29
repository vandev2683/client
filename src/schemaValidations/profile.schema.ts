import type { z } from 'zod'
import { RoleSchema } from './role.schema'
import { UserSchema } from './user.schema'

export const profileSchema = UserSchema.omit({
  password: true,
  totpSecret: true
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true
  })
})

export type ProfileType = z.infer<typeof profileSchema>
