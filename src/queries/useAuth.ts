import authApis from '@/apis/auth'
import { useMutation } from '@tanstack/react-query'

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApis.login
  })
}

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApis.logout
  })
}
