import http from '@/lib/http'
import type {
  GetAllProductsResType,
  GetProductsResType,
  ProductDetailType,
  ProductQueryType
} from '@/schemaValidations/product.schema'

const BASE_URL = '/products'

const productApis = {
  list(query: ProductQueryType) {
    return http.get<GetProductsResType>(BASE_URL, {
      params: query
    })
  },

  findAll() {
    return http.get<GetAllProductsResType>(`${BASE_URL}/all`)
  },

  findDetail(productId: number) {
    return http.get<ProductDetailType>(`${BASE_URL}/${productId}`)
  }
}

export default productApis
