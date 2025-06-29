import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect } from 'react'
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
  // Sử dụng useEffect để tạo variants từ variantsConfig khi component mount hoặc variantsConfig thay đổi
  useEffect(() => {
    if (variantsConfig.length > 0) {
      if (variantsConfig[0].type === '') {
        // Nếu variantsConfig có phần tử đầu tiên không có type, thì tạo một biến thể mặc định
        setVariants([
          {
            value: 'default',
            price: 0,
            stock: 0,
            thumbnail: null
          }
        ])

        return
      }
      const generatedVariants = generateVariants(variantsConfig)
      setVariants(generatedVariants)
    }
  }, [variantsConfig, setVariants])

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
            <Card key={variant.value + index} className='border border-gray-200 hover:shadow-md transition-shadow'>
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

                  <div className='flex flex-col gap-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500 w-6'>Giá</span>
                      <Input
                        type='number'
                        value={variant.price}
                        onChange={(e) => {
                          const updatedVariants = variants.map((v) =>
                            v.value === variant.value ? { ...v, price: Number(e.target.value) } : v
                          )
                          setVariants(updatedVariants)
                        }}
                        className='w-24 h-8 text-sm'
                        placeholder='Giá'
                      />
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500 w-6'>Kho</span>
                      <Input
                        type='number'
                        value={variant.stock}
                        onChange={(e) => {
                          const updatedVariants = variants.map((v) =>
                            v.value === variant.value ? { ...v, stock: Number(e.target.value) } : v
                          )
                          setVariants(updatedVariants)
                        }}
                        className='w-24 h-8 text-sm'
                        placeholder='Kho'
                      />
                    </div>
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
