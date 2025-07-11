import http from '@/lib/http'
import type {
  ChangePasswordBodyType,
  GetOrdersProfileResType,
  ProfileType,
  UpdateProfileBodyType
} from '@/schemaValidations/profile.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'

const BASE_URL = '/profile'

const profileApis = {
  getOrders() {
    return http.get<GetOrdersProfileResType>(`${BASE_URL}/orders`)
  },

  update(body: UpdateProfileBodyType) {
    return http.put<ProfileType>(BASE_URL, body)
  },

  changePassword(body: ChangePasswordBodyType) {
    return http.patch<MessageResType>(`${BASE_URL}/change-password`, body)
  }
}

export default profileApis
