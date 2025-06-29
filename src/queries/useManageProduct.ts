import manageProductApis from '@/apis/manage-product'
import type { ProductQueryType } from '@/schemaValidations/product.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useProductsQuery = (query: ProductQueryType) => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => manageProductApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllProductsQuery = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: manageProductApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useProductDetailQuery = (productId: number | undefined) => {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: () => manageProductApis.findDetail(productId as number),
    enabled: productId !== undefined && productId > 0
  })
}

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: manageProductApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: true })
    }
  })
}

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: manageProductApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: true })
    }
  })
}

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: manageProductApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'], exact: true })
    }
  })
}
