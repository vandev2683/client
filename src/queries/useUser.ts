import userApis from '@/apis/user'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useUsersQuery = (query: PaginationQueryType) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllUsersQuery = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useUserDetailQuery = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userApis.findDetail(userId as number),
    enabled: userId !== undefined && userId > 0
  })
}

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true })
    }
  })
}

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true })
    }
  })
}

export const useChangePasswordMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApis.changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true })
    }
  })
}

export const useChangeUserStatusMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApis.changeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true })
    }
  })
}

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true })
    }
  })
}
