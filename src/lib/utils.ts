/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from 'clsx'
import { type UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import type { LoginResType } from '@/schemaValidations/auth.schema'
import type { ProfileType } from '@/schemaValidations/profile.schema'
import type { AccessTokenPayloadType, RefreshTokenPayloadType } from '@/types/jwt.t'
import { EntityError } from '@/constants/error'
import { jwtDecode } from 'jwt-decode'
import { format } from 'date-fns'
import { AxiosError } from 'axios'
import { HttpStatus } from '@/constants/http'

export const LocalStorageEventTarget = new EventTarget()

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatUrl = (url: string) => {
  return url.startsWith('/') ? url.slice(1) : url
}

export const getAccessTokenFromLocalStorage = () => {
  return localStorage.getItem('accessToken') || ''
}

export const setAccessTokenToLocalStorage = (token: string) => {
  localStorage.setItem('accessToken', token)
}

export const getRefreshTokenFromLocalStorage = () => {
  return localStorage.getItem('refreshToken') || ''
}

export const setRefreshTokenToLocalStorage = (token: string) => {
  localStorage.setItem('refreshToken', token)
}

export const setProfileToLocalStorage = (profile: ProfileType) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}

export const getProfileFromLocalStorage = (): LoginResType['user'] | null => {
  const profile = localStorage.getItem('profile')
  return profile ? JSON.parse(profile) : null
}

export const clearLocalStorage = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('profile')
  const clearEvent = new Event('clearLocalStorage')
  LocalStorageEventTarget.dispatchEvent(clearEvent)
}

export const decodedAccessToken = (token: string) => {
  return jwtDecode<AccessTokenPayloadType>(token)
}

export const decodedRefreshToken = (token: string) => {
  return jwtDecode<RefreshTokenPayloadType>(token)
}

export function handleError(error: any, setError?: UseFormSetError<any>, duration?: number) {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        message: item.message,
        type: 'server'
      })
    })
  } else if (error instanceof AxiosError && error.status === HttpStatus.Entity && setError) {
    if (typeof error.response?.data.message === 'string') {
      setError(error.response.data.path, {
        message: error.response.data.message,
        type: 'server'
      })
      return
    }
    error.response?.data.message.forEach((item: { path: string; message: string }) => {
      setError(item.path, {
        message: item.message,
        type: 'server'
      })
    })
  }
  // else {
  //   toast('Error', {
  //     description: error.response.data.message ?? 'Error not exist',
  //     duration: duration ?? 3000
  //   })
  // }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number)
}

export const removeVietnameseAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm dd/MM/yyyy')
}

export const getFirstNameClient = (name: string) => {
  const arr = name.split(' ')
  const firstName = arr[arr.length - 1]
  const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  if (formattedFirstName.length > 6) {
    return formattedFirstName.slice(0, 6) + '...'
  }
  return formattedFirstName
}

export const generateNameId = (params: { name: string; id: number }) => {
  return `${params.name}-.${params.id}`
}

export const getIdByNameId = (productName: string) => {
  return productName.split('-.')[1]
}
