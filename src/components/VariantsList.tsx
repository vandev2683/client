import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect } from 'react'
import type { ProductVariantsType, UpsertVariantBodyType, VariantType } from '@/schemaValidations/product.schema'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

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
  variantsInDB,
  variants,
  setVariants
}: {
  variantsConfig: ProductVariantsType
  variantsInDB?: VariantType[]
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
      if (variantsInDB && variantsInDB.length > 0) {
        const allVariants = [
          ...variantsInDB,
          ...generatedVariants.filter((variant) => !variantsInDB.some((v) => v.value === variant.value))
        ]
        setVariants(allVariants)
        return
      }

      setVariants(generatedVariants)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className='space-y-4'>
      <div className='flex items-center justify-end mb-2'>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type='button' variant='outline' size='sm' className='flex items-center gap-2 cursor-pointer'>
                  <RefreshCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Default. Xóa các thuộc tính hiện có</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Badge variant='outline' className='flex items-center cursor-default gap-2 p-2 font-medium'>
            <Package className='w-8 h-8' />
            <span className='font-medium text-gray-900'>{variants.length} biến thể</span>
          </Badge>
        </div>
      </div>
      <ScrollArea className='max-h-[500px] overflow-y-auto'>
        <div className='space-y-3'>
          {variants.map((variant, index) => {
            const attributes = parseAttributes(variant.value)
            return (
              <Card key={variant.value + index} className='border border-gray-200 hover:shadow-md transition-shadow'>
                <CardContent>
                  <div className='flex items-center justify-between'>
                    <div className='max-w-[60%]'>
                      <p className='text-gray-900'>
                        {index + 1}: {variant.value}
                      </p>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {Object.entries(attributes).map(([key, value]) => (
                          <Badge key={key} variant='outline' className='text-xs'>
                            {value === 'default' ? 'default' : key}: {value}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <div className='flex flex-col gap-3'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs text-gray-500 w-6'>Giá</span>
                          <Input
                            type='text'
                            value={variant.price}
                            onChange={(e) => {
                              if (isNaN(Number(e.target.value))) {
                                return
                              }
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
                            type='text'
                            value={variant.stock}
                            onChange={(e) => {
                              if (isNaN(Number(e.target.value))) {
                                return
                              }
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
                      <Button
                        onClick={() => {
                          const newVariants = variants.filter((v) => v.value !== variant.value)
                          setVariants(newVariants)
                        }}
                        variant='ghost'
                        className='text-red-500 hover:text-red-700 hover:bg-red-50'
                        type='button'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
