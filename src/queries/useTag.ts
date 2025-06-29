import tagApis from '@/apis/tag'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useTagsQuery = (query: PaginationQueryType) => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllTagsQuery = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useTagDetailQuery = (tagId: number | undefined) => {
  return useQuery({
    queryKey: ['tags', tagId],
    queryFn: () => tagApis.findDetail(tagId as number),
    enabled: tagId !== undefined && tagId > 0
  })
}

export const useCreateTagMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tagApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'], exact: true })
    }
  })
}

export const useUpdateTagMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tagApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'], exact: true })
    }
  })
}

export const useDeleteTagMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tagApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'], exact: true })
    }
  })
}
