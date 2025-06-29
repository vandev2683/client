import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Edit, Trash2, Package } from 'lucide-react'
import { ProductVariant } from '../types/product'

const VariantList = () => {
  const [variants] = useState<ProductVariant[]>([
    {
      id: '1',
      name: 'Trắng - Size S',
      attributes: { 'Màu sắc': 'Trắng', 'Kích thước': 'S' },
      price: 50000,
      stock: 100
    },
    {
      id: '2',
      name: 'Trắng - Size M',
      attributes: { 'Màu sắc': 'Trắng', 'Kích thước': 'M' },
      price: 50000,
      stock: 85
    },
    {
      id: '3',
      name: 'Đen - Size S',
      attributes: { 'Màu sắc': 'Đen', 'Kích thước': 'S' },
      price: 55000,
      stock: 120
    },
    {
      id: '4',
      name: 'Đen - Size M',
      attributes: { 'Màu sắc': 'Đen', 'Kích thước': 'M' },
      price: 55000,
      stock: 90
    }
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ price: 0, stock: 0 })

  const handleEdit = (variant: ProductVariant) => {
    setEditingId(variant.id)
    setEditValues({ price: variant.price, stock: variant.stock })
  }

  const handleSave = (id: string) => {
    console.log('Saving variant:', id, editValues)
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫'
  }

  if (variants.length === 0) {
    return (
      <div className='text-center py-12'>
        <Package className='w-12 h-12 text-gray-300 mx-auto mb-4' />
        <p className='text-gray-500 text-sm'>Chưa có biến thể nào được tạo</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        {variants.map((variant) => (
          <Card key={variant.id} className='border border-gray-200 hover:shadow-md transition-shadow'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 shadow-sm' />
                  <div>
                    <p className='font-medium text-gray-900'>{variant.name}</p>
                    <div className='flex gap-1 mt-1'>
                      {Object.entries(variant.attributes).map(([key, value]) => (
                        <Badge key={key} variant='outline' className='text-xs'>
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-6'>
                  {editingId === variant.id ? (
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
                        <Button size='sm' onClick={() => handleSave(variant.id)} className='h-8'>
                          Lưu
                        </Button>
                        <Button size='sm' variant='ghost' onClick={handleCancel} className='h-8'>
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        <Button size='sm' variant='ghost' className='h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600'>
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className='pt-4'>
        <Button variant='outline' className='w-full'>
          Thêm biến thể mới
        </Button>
      </div>
    </div>
  )
}

export default VariantList
