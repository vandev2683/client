import reviewApis from '@/apis/review'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useReviewsByProductQuery = (productId: number | undefined) => {
  return useQuery({
    queryKey: ['reviews', `productId-${productId}`],
    queryFn: () => reviewApis.findAllByProductId({ productId: productId as number }),
    enabled: productId !== undefined && productId > 0,
    placeholderData: keepPreviousData
  })
}

export const useReviewWithProductAndOrderQuery = (productId: number | undefined, orderId: number | undefined) => {
  return useQuery({
    queryKey: ['reviews', `productId-${productId}`, `orderId-${orderId}`],
    queryFn: () => reviewApis.findWithProductAndOrderId({ productId: productId as number, orderId: orderId as number }),
    enabled: productId !== undefined && productId > 0 && orderId !== undefined && orderId > 0,
    placeholderData: keepPreviousData
  })
}

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}
