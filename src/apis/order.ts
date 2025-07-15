import http from '@/lib/http'
import type {
  ChangeOrderStatusBodyType,
  CreateOnlineOrderBodyType,
  CreateOrderResType,
  GetAllOrdersResType,
  GetOrdersResType,
  OrderDetailType,
  OrderQueryType
} from '@/schemaValidations/order.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'

const BASE_URL = '/orders'

const orderApis = {
  list(query: OrderQueryType) {
    return http.get<GetOrdersResType>(BASE_URL, {
      params: query
    })
  },

  findAll() {
    return http.get<GetAllOrdersResType>(`${BASE_URL}/all`)
  },

  findDetail(orderId: number) {
    return http.get<OrderDetailType>(`${BASE_URL}/${orderId}`)
  },

  createOnlineOrder(body: CreateOnlineOrderBodyType) {
    return http.post<CreateOrderResType>(`${BASE_URL}/create-online`, body)
  },

  changeOrderStatus({ orderId, body }: { orderId: number; body: ChangeOrderStatusBodyType }) {
    return http.patch<MessageResType>(`${BASE_URL}/${orderId}/change-status`, body)
  }
}

export default orderApis
