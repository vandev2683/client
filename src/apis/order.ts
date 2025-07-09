import http from '@/lib/http'
import type { CreateOnlineOrderBodyType, CreateOrderResType } from '@/schemaValidations/order.schema'

const BASE_URL = '/orders'

const orderApis = {
  createOnlineOrder(body: CreateOnlineOrderBodyType) {
    return http.post<CreateOrderResType>(`${BASE_URL}/create/online`, body)
  }
}

export default orderApis
