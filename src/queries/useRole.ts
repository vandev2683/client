import roleApis from '@/apis/role'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useRolesQuery = (query: PaginationQueryType) => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllRolesQuery = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: roleApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useRoleDetailQuery = (roleId: number | undefined) => {
  return useQuery({
    queryKey: ['roles', roleId],
    queryFn: () => roleApis.findDetail(roleId as number),
    enabled: roleId !== undefined && roleId > 0
  })
}

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: roleApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'], exact: true })
    }
  })
}

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: roleApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'], exact: true })
    }
  })
}

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: roleApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'], exact: true })
    }
  })
}
