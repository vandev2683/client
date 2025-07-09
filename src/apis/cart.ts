import http from '@/lib/http'
import type {
  CreateCartItemBodyType,
  DeleteCartItemBodyType,
  GetAllCartItemsResType,
  UpdateCartItemBodyType
} from '@/schemaValidations/cart.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'

const BASE_URL = '/cart'

const cartApis = {
  findAll() {
    return http.get<GetAllCartItemsResType>(BASE_URL)
  },

  addToCart(body: CreateCartItemBodyType) {
    return http.post<MessageResType>(BASE_URL, body)
  },

  updateCartItem(payload: { cartItemId: number; body: UpdateCartItemBodyType }) {
    const { cartItemId, body } = payload
    return http.put<MessageResType>(`${BASE_URL}/${cartItemId}`, body)
  },

  deleteCartItem(body: DeleteCartItemBodyType) {
    return http.post<MessageResType>(`${BASE_URL}/delete-items`, body)
  }
}

export default cartApis
