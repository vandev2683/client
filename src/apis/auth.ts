import http from '@/lib/http'
import type {
  GoogleAuthResType,
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RegisterBodyType,
  SendOTPBodyType
} from '@/schemaValidations/auth.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'

const BASE_URL = '/auth'

const authApis = {
  sendOTP(body: SendOTPBodyType) {
    return http.post<MessageResType>(`${BASE_URL}/otp`, body)
  },

  register(body: RegisterBodyType) {
    return http.post<MessageResType>(`${BASE_URL}/register`, body)
  },

  login(body: LoginBodyType) {
    return http.post<LoginResType>(`${BASE_URL}/login`, body)
  },

  getGoogleLink() {
    return http.get<GoogleAuthResType>(`${BASE_URL}/google-link`)
  },

  logout(body: LogoutBodyType) {
    return http.post<MessageResType>(`${BASE_URL}/logout`, body)
  }
}

export default authApis
