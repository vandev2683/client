import http from '@/lib/http'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'
import type {
  CreateRoleBodyType,
  GetAllRolesResType,
  GetRoleDetailResType,
  GetRolesResType,
  RoleType,
  UpdateRoleBodyType
} from '@/schemaValidations/role.schema'

const BASE_URL = '/roles'

const roleApis = {
  list(query: PaginationQueryType) {
    return http.get<GetRolesResType>(BASE_URL, {
      params: query
    })
  },

  findAll() {
    return http.get<GetAllRolesResType>(`${BASE_URL}/all`)
  },

  findDetail(roleId: number) {
    return http.get<GetRoleDetailResType>(`${BASE_URL}/${roleId}`)
  },

  create(body: CreateRoleBodyType) {
    return http.post<RoleType>(BASE_URL, body)
  },

  update(payload: { roleId: number; body: UpdateRoleBodyType }) {
    const { roleId, body } = payload
    return http.put<RoleType>(`${BASE_URL}/${roleId}`, body)
  },

  delete(roleId: number) {
    return http.delete<MessageResType>(`${BASE_URL}/${roleId}`)
  }
}

export default roleApis
