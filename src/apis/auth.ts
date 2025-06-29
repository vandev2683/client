import http from '@/lib/http'
import type { LoginBodyType, LoginResType, LogoutBodyType } from '@/schemaValidations/auth.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'

const BASE_URL = '/auth'

const authApis = {
  login(body: LoginBodyType) {
    return http.post<LoginResType>(`${BASE_URL}/login`, body)
  },

  logout(body: LogoutBodyType) {
    return http.post<MessageResType>(`${BASE_URL}/logout`, body)
  }
}

export default authApis
