import http from '@/lib/http'
import type { GetPaymentLinkBodyType, GetPaymentLinkResType } from '@/schemaValidations/payment.schema'

const BASE_URL = '/payment'

const paymentApis = {
  createLink(body: GetPaymentLinkBodyType) {
    return http.post<GetPaymentLinkResType>(`${BASE_URL}/create-link`, body)
  }
}
export default paymentApis
