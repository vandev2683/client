import tableApis from '@/apis/table'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useTablesQuery = (query: PaginationQueryType) => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllTablesQuery = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tableApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useTableDetailQuery = (tableId: number | undefined) => {
  return useQuery({
    queryKey: ['tables', tableId],
    queryFn: () => tableApis.findDetail(tableId as number),
    enabled: tableId !== undefined && tableId > 0
  })
}

export const useCreateTableMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tableApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'], exact: true })
    }
  })
}

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tableApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'], exact: true })
    }
  })
}

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tableApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'], exact: true })
    }
  })
}
