import http from '@/lib/http'
import type {
  CreateProductBodyType,
  GetAllProductsResType,
  GetProductDetailResType,
  GetProductsResType,
  ProductQueryType,
  ProductType,
  UpdateProductBodyType
} from '@/schemaValidations/product.schema'

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

  delete(productId: number) {
    return http.delete(`${BASE_URL}/${productId}`)
  }
}

export default manageProductApis
