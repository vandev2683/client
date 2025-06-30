import http from '@/lib/http'
import type {
  ChangeProductStatusBodyType,
  CreateProductBodyType,
  GetAllProductsResType,
  GetProductDetailResType,
  GetProductsResType,
  ProductQueryType,
  ProductType,
  UpdateProductBodyType
} from '@/schemaValidations/product.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'

const BASE_URL = '/manage-products'

const manageProductApis = {
  list(query: ProductQueryType) {
    return http.get<GetProductsResType>(BASE_URL, {
      params: query
    })
  },

  findAll() {
    return http.get<GetAllProductsResType>(`${BASE_URL}/all`)
  },

  findDetail(productId: number) {
    return http.get<GetProductDetailResType>(`${BASE_URL}/${productId}`)
  },

  create(body: CreateProductBodyType) {
    return http.post<ProductType>(BASE_URL, body)
  },

  update(payload: { productId: number; body: UpdateProductBodyType }) {
    const { productId, body } = payload
    return http.put<ProductType>(`${BASE_URL}/${productId}`, body)
  },

  changeStatus(payload: { productId: number; body: ChangeProductStatusBodyType }) {
    const { productId, body } = payload
    return http.patch<MessageResType>(`${BASE_URL}/${productId}/change-status`, body)
  },

  delete(productId: number) {
    return http.delete<MessageResType>(`${BASE_URL}/${productId}`)
  }
}

export default manageProductApis
