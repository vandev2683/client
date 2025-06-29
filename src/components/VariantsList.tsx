import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Edit, Save, X, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect } from 'react'
import type { ProductVariantsType, UpsertVariantBodyType } from '@/schemaValidations/product.schema'

export function generateVariants(variants: ProductVariantsType) {
  // Hàm hỗ trợ để tạo tất cả tổ hợp
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? ' / ' : ''}${y}`)), [''])
  }

  // Lấy mảng các options từ variants
  const options = variants.map((variant) => variant.options)

  // Tạo tất cả tổ hợp
  const combinations = getCombinations(options)

  // Chuyển tổ hợp thành SKU objects
  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 0,
    thumbnail: null
  }))
}

export default function VariantsList({
  variantsConfig,
  variants,
  setVariants
}: {
  variantsConfig: ProductVariantsType
  variants: UpsertVariantBodyType[]
  setVariants: (variants: UpsertVariantBodyType[]) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ price: 0, stock: 0 })

  // Sử dụng useEffect để tạo variants từ variantsConfig khi component mount hoặc variantsConfig thay đổi
  useEffect(() => {
    if (variantsConfig.length > 0) {
      const generatedVariants = generateVariants(variantsConfig)
      setVariants(generatedVariants)
    }
  }, [variantsConfig, setVariants])

  const handleEdit = (variant: UpsertVariantBodyType) => {
    setEditingId(variant.value)
    setEditValues({ price: variant.price, stock: variant.stock })
  }

  const handleSave = (value: string) => {
    const updatedVariants = variants.map((variant) =>
      variant.value === value ? { ...variant, price: editValues.price, stock: editValues.stock } : variant
    )
    setVariants(updatedVariants)
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const handleDelete = (value: string) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa biến thể này không?')
    if (confirmed) {
      const updatedVariants = variants.filter((variant) => variant.value !== value)
      setVariants(updatedVariants)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫'
  }

  const parseAttributes = (value: string) => {
    const attributes: Record<string, string> = {}
    const parts = value.split(' / ')

    variantsConfig.forEach((config, index) => {
      if (parts[index]) {
        attributes[config.type] = parts[index]
      }
    })

    return attributes
  }

  // Nếu không có biến thể
  if (variants.length === 0) {
    return (
      <div className='text-center py-12'>
        <Package className='w-12 h-12 text-gray-300 mx-auto mb-4' />
        <p className='text-gray-500 text-sm'>Chưa có biến thể nào được tạo</p>
      </div>
    )
  }

  return (
    <ScrollArea className='max-h-[500px] overflow-y-auto'>
      <div className='space-y-3'>
        {variants.map((variant, index) => {
          const attributes = parseAttributes(variant.value)

          return (
            <Card key={variant.value} className='border border-gray-200 hover:shadow-md transition-shadow'>
              <CardContent className=''>
                <div className='flex items-center justify-between'>
                  <div className='max-w-[60%]'>
                    <p className='text-gray-900'>
                      {index + 1}: {variant.value}
                    </p>
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {Object.entries(attributes).map(([key, value]) => (
                        <Badge key={key} variant='outline' className='text-xs'>
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className='flex items-center gap-6'>
                    {editingId === variant.value ? (
                      <div className='flex items-center gap-2'>
                        <div className='flex flex-col gap-1'>
                          <Input
                            type='number'
                            value={editValues.price}
                            onChange={(e) => setEditValues((prev) => ({ ...prev, price: Number(e.target.value) }))}
                            className='w-24 h-8 text-sm'
                            placeholder='Giá'
                          />
                          <span className='text-xs text-gray-500'>Giá</span>
                        </div>
                        <div className='flex flex-col gap-1'>
                          <Input
                            type='number'
                            value={editValues.stock}
                            onChange={(e) => setEditValues((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                            className='w-20 h-8 text-sm'
                            placeholder='Kho'
                          />
                          <span className='text-xs text-gray-500'>Kho</span>
                        </div>
                        <div className='flex gap-1'>
                          <Button size='sm' onClick={() => handleSave(variant.value)} className='h-8'>
                            <Save className='w-4 h-4 mr-1' /> Lưu
                          </Button>
                          <Button size='sm' variant='ghost' onClick={handleCancel} className='h-8'>
                            <X className='w-4 h-4 mr-1' /> Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className='text-right'>
                          <p className='font-semibold text-gray-900'>{formatPrice(variant.price)}</p>
                          <p className='text-sm text-gray-500'>Kho: {variant.stock}</p>
                        </div>
                        <div className='flex gap-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleEdit(variant)}
                            className='h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600'
                            title='Chỉnh sửa'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600'
                            onClick={() => handleDelete(variant.value)}
                            title='Xóa'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
