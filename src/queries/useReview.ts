import reviewApis from '@/apis/review'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const BASE_KEY = 'reviews'

export const useProductReviewsQuery = (productId: number | undefined) => {
  return useQuery({
    queryKey: [BASE_KEY, productId],
    queryFn: () => reviewApis.list({ productId: productId as number }),
    enabled: productId !== undefined && productId > 0,
    placeholderData: keepPreviousData
  })
}

export const useReviewDetailQuery = (productId: number | undefined, orderId: number | undefined) => {
  return useQuery({
    queryKey: [BASE_KEY, productId, orderId],
    queryFn: () => reviewApis.findDetail({ productId: productId as number, orderId: orderId as number }),
    enabled: productId !== undefined && productId > 0 && orderId !== undefined && orderId > 0
  })
}

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    }
  })
}

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    }
  })
}

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    }
  })
}
