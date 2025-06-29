import http from '@/lib/http'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'
import type {
  ChangePasswordBodyType,
  CreateUserBodyType,
  GetAllUsersResType,
  GetUsersResType,
  UpdateUserBodyType,
  UserType
} from '@/schemaValidations/user.schema'

const BASE_URL = '/users'

const userApis = {
  list(query: PaginationQueryType) {
    return http.get<GetUsersResType>(BASE_URL, {
      params: query
    })
  },

  findAll() {
    return http.get<GetAllUsersResType>(`${BASE_URL}/all`)
  },

  findDetail(userId: number) {
    return http.get<UserType>(`${BASE_URL}/${userId}`)
  },

  create(body: CreateUserBodyType) {
    return http.post<UserType>(BASE_URL, body)
  },

  update(payload: { userId: number; body: UpdateUserBodyType }) {
    const { userId, body } = payload
    return http.put<UserType>(`${BASE_URL}/${userId}`, body)
  },

  changePassword(body: ChangePasswordBodyType) {
    return http.patch<MessageResType>(`${BASE_URL}/change-password`, body)
  },

  delete(userId: number) {
    return http.delete<MessageResType>(`${BASE_URL}/${userId}`)
  }
}

export default userApis
