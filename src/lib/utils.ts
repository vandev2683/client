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
import { ProductStatus, TypeProduct } from '@/constants/product'
import { TagType } from '@/constants/tag'
import { CouponDiscountType } from '@/constants/coupon'
import { TableStatus } from '@/constants/table'
import { toast } from 'sonner'
import { UserStatus } from '@/constants/user'
import { RoleName } from '@/constants/role'
import { OrderStatus, OrderType } from '@/constants/order'
import type { ProductVariantsType } from '@/schemaValidations/product.schema'

// HTML utilities
export const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

export const getPlainTextFromHtml = (html: string): string => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

export const getHtmlPlainTextTitle = (html: string): string => {
  return decodeHtmlEntities(getPlainTextFromHtml(html))
}

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
  } else if (error instanceof AxiosError) {
    if (error.status === HttpStatus.Entity && setError) {
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
    } else {
      const errorName = error.response?.data.error || 'Unknown Error'
      const errorMessage = error.response?.data.message || 'An unexpected error occurred'
      toast.error(errorName, {
        description: errorMessage,
        duration: duration ?? 3000
      })
    }
  }
  // else {
  //   toast('Error', {
  //     description: error.response.data.message ?? 'Error not exist',
  //     duration: duration ?? 3000
  //   })
  // }
}

export const formatTypeProduct = (type: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (type) {
      case TypeProduct.Single:
        return 'Món đơn'
      case TypeProduct.FixedCombo:
        return 'Combo cố định'
      case TypeProduct.CustomCombo:
        return 'Combo tùy chỉnh'
    }
  } else {
    switch (type) {
      case TypeProduct.Single:
        return 'Single'
      case TypeProduct.FixedCombo:
        return 'Fixed Combo'
      case TypeProduct.CustomCombo:
        return 'Custom Combo'
    }
  }
}

export const formatProductStatus = (status: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (status) {
      case ProductStatus.Pending:
        return 'Chờ duyệt'
      case ProductStatus.Available:
        return 'Còn hàng'
      case ProductStatus.OutOfStock:
        return 'Hết hàng'
      case ProductStatus.Hidden:
        return 'Ẩn sản phẩm'
    }
  } else {
    switch (status) {
      case ProductStatus.Pending:
        return 'Pending'
      case ProductStatus.Available:
        return 'Available'
      case ProductStatus.OutOfStock:
        return 'Out of stock'
      case ProductStatus.Hidden:
        return 'Hidden'
    }
  }
}

export const formatTagType = (type: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (type) {
      case TagType.Custom:
        return 'Tùy chỉnh'
      case TagType.Marketing:
        return 'Marketing'
      case TagType.Seasonal:
        return 'Theo mùa'
      case TagType.Spice:
        return 'Gia vị'
    }
  } else {
    switch (type) {
      case TagType.Custom:
        return 'Custom'
      case TagType.Marketing:
        return 'Marketing'
      case TagType.Seasonal:
        return 'Seasonal'
      case TagType.Spice:
        return 'Spice'
    }
  }
}

export const formatCouponStatus = (isActive: boolean, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (isActive) {
      case true:
        return 'Hoạt động'
      case false:
        return 'Dừng hoạt động'
    }
  } else {
    switch (isActive) {
      case true:
        return 'Active'
      case false:
        return 'Inactive'
    }
  }
}

export const formatCouponDiscountType = (type: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (type) {
      case CouponDiscountType.Percent:
        return 'Phần trăm'
      case CouponDiscountType.Amount:
        return 'Số tiền'
    }
  } else {
    switch (type) {
      case CouponDiscountType.Percent:
        return 'Percent'
      case CouponDiscountType.Amount:
        return 'Amount'
    }
  }
}

export const formatTableStatus = (status: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (status) {
      case TableStatus.Available:
        return 'Trống'
      case TableStatus.Occupied:
        return 'Đang sử dụng'
      case TableStatus.Reserved:
        return 'Đã đặt'
      case TableStatus.Cleaning:
        return 'Đang dọn dẹp'
      case TableStatus.Disabled:
        return 'Không sử dụng'
    }
  } else {
    switch (status) {
      case TableStatus.Available:
        return 'Available'
      case TableStatus.Occupied:
        return 'Occupied'
      case TableStatus.Reserved:
        return 'Reserved'
      case TableStatus.Cleaning:
        return 'Cleaning'
      case TableStatus.Disabled:
        return 'Disabled'
    }
  }
}

export const formatUserStatus = (status: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (status) {
      case UserStatus.Active:
        return 'Hoạt động'
      case UserStatus.Inactive:
        return 'Không hoạt động'
      case UserStatus.Blocked:
        return 'Bị cấm'
    }
  } else {
    switch (status) {
      case UserStatus.Active:
        return 'Active'
      case UserStatus.Inactive:
        return 'Inactive'
      case UserStatus.Blocked:
        return 'Blocked'
    }
  }
}

export const formatRoleName = (name: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (name) {
      case RoleName.Admin:
        return 'Quản trị viên'
      case RoleName.Manager:
        return 'Quản lý'
      case RoleName.Employee:
        return 'Nhân viên'
      case RoleName.Client:
        return 'Khách hàng'
      case RoleName.Guest:
        return 'Khách vãng lai'
    }
  } else {
    switch (name) {
      case RoleName.Admin:
        return 'Admin'
      case RoleName.Manager:
        return 'Manager'
      case RoleName.Employee:
        return 'Employee'
      case RoleName.Client:
        return 'Client'
      case RoleName.Guest:
        return 'Guest'
    }
  }
}

export const formatRoleStatus = (isActive: boolean, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (isActive) {
      case true:
        return 'Hoạt động'
      case false:
        return 'Dừng hoạt động'
    }
  } else {
    switch (isActive) {
      case true:
        return 'Active'
      case false:
        return 'Inactive'
    }
  }
}

export const formatOrderStatus = (status: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (status) {
      case OrderStatus.Pending:
        return 'Chờ xử lý'
      case OrderStatus.Confirmed:
        return 'Đã xác nhận'
      case OrderStatus.Preparing:
        return 'Đang chuẩn bị'
      case OrderStatus.Ready:
        return 'Sẵn sàng'
      case OrderStatus.OutForDelivery:
        return 'Đang giao hàng'
      case OrderStatus.Served:
        return 'Đã phục vụ'
      case OrderStatus.Completed:
        return 'Đã hoàn thành'
      case OrderStatus.Cancelled:
        return 'Đã hủy'
    }
  } else {
    switch (status) {
      case OrderStatus.Pending:
        return 'Pending'
      case OrderStatus.Confirmed:
        return 'Confirmed'
      case OrderStatus.Preparing:
        return 'Preparing'
      case OrderStatus.Ready:
        return 'Ready'
      case OrderStatus.OutForDelivery:
        return 'Out for delivery'
      case OrderStatus.Served:
        return 'Served'
      case OrderStatus.Completed:
        return 'Completed'
      case OrderStatus.Cancelled:
        return 'Cancelled'
    }
  }
}

export const formatOrderType = (type: string, lang: string = 'vi') => {
  if (lang === 'vi') {
    switch (type) {
      case OrderType.Delivery:
        return 'Giao hàng'
      case OrderType.DineIn:
        return 'Ăn tại chỗ'
    }
  } else {
    switch (type) {
      case OrderType.Delivery:
        return 'Delivery'
      case OrderType.DineIn:
        return 'Dine in'
    }
  }
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
  return format(date instanceof Date ? date : new Date(date), 'HH:mm, dd/MM/yyyy')
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

export const parseVariantInfo = (variantValue: string, variantsConfig: ProductVariantsType) => {
  if (!variantsConfig || variantsConfig.length === 0) return null

  const parts = variantValue.split(' / ')
  const variantInfo: Array<{ type: string; value: string }> = []

  variantsConfig.forEach((config, index) => {
    if (parts[index] && config.type !== 'default') {
      variantInfo.push({
        type: config.type,
        value: parts[index]
      })
    }
  })

  return variantInfo
}
