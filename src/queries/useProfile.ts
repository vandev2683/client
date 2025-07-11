import profileApis from '@/apis/profile'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

export const useGetOrdersProfileQuery = () => {
  return useQuery({
    queryKey: ['profile-orders'],
    queryFn: profileApis.getOrders,
    placeholderData: keepPreviousData
  })
}

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: profileApis.update
  })
}

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: profileApis.changePassword
  })
}
