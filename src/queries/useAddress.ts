import addressApis from '@/apis/address'
import type { AddressType, CreateAddressBodyType } from '@/schemaValidations/address.schema'
import type { PaginationQueryType } from '@/schemaValidations/request.schema'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useAddressesQuery = (query: PaginationQueryType) => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApis.list(query),
    placeholderData: keepPreviousData
  })
}

export const useAllAddressesQuery = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: addressApis.findAll,
    placeholderData: keepPreviousData
  })
}

export const useAddressDetailQuery = (addressId: number | undefined) => {
  return useQuery({
    queryKey: ['addresses', addressId],
    queryFn: () => addressApis.findDetail(addressId as number),
    enabled: addressId !== undefined && addressId > 0
  })
}

export const useCreateAddressMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addressApis.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'], exact: true })
    }
  })
}

export const useUpdateAddressMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addressApis.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'], exact: true })
    }
  })
}

export const useChangeDefaultAddressMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addressApis.changeDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'], exact: true })
    }
  })
}

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addressApis.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'], exact: true })
    }
  })
}
