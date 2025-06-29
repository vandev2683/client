import permissionApis from '@/apis/permission'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const usePermissionsQuery = (query: PaginationQueryType) => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllPermissionsQuery = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: permissionApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const usePermissionDetailQuery = (permissionId: number | undefined) => {
  return useQuery({
    queryKey: ['permissions', permissionId],
    queryFn: () => permissionApis.findDetail(permissionId as number),
    enabled: permissionId !== undefined && permissionId > 0
  })
}

export const useCreatePermissionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: permissionApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'], exact: true })
    }
  })
}

export const useUpdatePermissionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: permissionApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'], exact: true })
    }
  })
}

export const useDeletePermissionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: permissionApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'], exact: true })
    }
  })
}
