import cartApis from '@/apis/cart'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useAllCartItemsQuery = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartApis.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'], exact: true })
    }
  })
}

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartApis.updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'], exact: true })
    }
  })
}

export const useDeleteCartItemMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cartApis.deleteCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'], exact: true })
    }
  })
}
