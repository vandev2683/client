import orderApis from '@/apis/order'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useCreateOnlineOrderMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orderApis.createOnlineOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'], exact: true })
    }
  })
}
