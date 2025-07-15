import productApis from '@/apis/product'
import type { ProductQueryType } from '@/schemaValidations/product.schema'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

const BASE_KEY = 'products'

export const useProductsQuery = (query: ProductQueryType) => {
  return useQuery({
    queryKey: [BASE_KEY],
    queryFn: () => productApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllProductsQuery = () => {
  return useQuery({
    queryKey: [BASE_KEY],
    queryFn: () => productApis.findAll(),
    placeholderData: keepPreviousData
  })
}

export const useProductDetailQuery = (productId: number | undefined) => {
  return useQuery({
    queryKey: [BASE_KEY, productId],
    queryFn: () => productApis.findDetail(productId as number),
    enabled: productId !== undefined && productId > 0
  })
}
