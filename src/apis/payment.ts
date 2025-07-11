import http from '@/lib/http'
import type { PaymentLinkBodyType, PaymentLinkResType } from '@/schemaValidations/payment.schema'

const BASE_URL = '/payment'

const paymentApis = {
  createLink(body: PaymentLinkBodyType) {
    return http.post<PaymentLinkResType>(`${BASE_URL}/link`, body)
  }
}
export default paymentApis
