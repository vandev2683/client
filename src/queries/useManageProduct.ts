import manageProductApis from '@/apis/manage-product'
import type { ProductQueryType } from '@/schemaValidations/product.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const BASE_KEY = 'products'

export const useProductsQuery = (query: ProductQueryType) => {
  return useQuery({
    queryKey: [BASE_KEY],
    queryFn: () => manageProductApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllProductsQuery = () => {
  return useQuery({
    queryKey: [BASE_KEY],
    queryFn: manageProductApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useProductDetailQuery = (productId: number | undefined) => {
  return useQuery({
    queryKey: [BASE_KEY, productId],
    queryFn: () => manageProductApis.findDetail(productId as number),
    enabled: productId !== undefined && productId > 0
  })
}

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: manageProductApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY], exact: true })
    }
  })
}

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: manageProductApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    }
  })
}

export const useChangeProductStatusMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: manageProductApis.changeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY], exact: true })
    }
  })
}

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: manageProductApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY], exact: true })
    }
  })
}
