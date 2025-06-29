export const ProductStatus = {
  Pending: 'Pending',
  Available: 'Available',
  OutOfStock: 'OutOfStock',
  Hidden: 'Hidden'
} as const

export type ProductStatusType = (typeof ProductStatus)[keyof typeof ProductStatus]

export const ProductSatusValues = Object.values(ProductStatus)
