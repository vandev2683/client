import http from '@/lib/http'
import type { GetDistrictDetailResType } from '@/schemaValidations/district.schema'
import type { GetAllProvincesResType, GetProvinceDetailResType } from '@/schemaValidations/province.schema'
import type { GetWardDetailResType } from '@/schemaValidations/ward.schema'

const locationApis = {
  findProvinces() {
    return http.get<GetAllProvincesResType>('/provinces/all')
  },

  findProvinceDetail(provinceId: number) {
    return http.get<GetProvinceDetailResType>(`/provinces/${provinceId}`)
  },

  findDistrictDetail(districtId: number) {
    return http.get<GetDistrictDetailResType>(`/districts/${districtId}`)
  },

  findWardDetail(wardId: number) {
    return http.get<GetWardDetailResType>(`/wards/${wardId}`)
  }
}

export default locationApis
