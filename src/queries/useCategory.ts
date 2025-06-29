import categoryApis from '@/apis/category'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useCategoriesQuery = (query: PaginationQueryType) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllCategoriesQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useCategoryDetailQuery = (categoryId: number | undefined) => {
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: () => categoryApis.findDetail(categoryId as number),
    enabled: categoryId !== undefined && categoryId > 0
  })
}

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: true })
    }
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: true })
    }
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: true })
    }
  })
}
