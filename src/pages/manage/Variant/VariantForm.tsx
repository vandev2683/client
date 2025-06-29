import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { ProductVariantForm, ProductVariant } from '../types/product'
import { useToast } from '@/hooks/use-toast'

const VariantForm = () => {
  const { toast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ProductVariantForm>({
    defaultValues: {
      options: [{ id: '1', name: 'Màu sắc', values: ['Trắng', 'Đen'] }],
      variants: []
    }
  })

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption
  } = useFieldArray({
    control,
    name: 'options'
  })

  const watchedOptions = watch('options')

  // Tự động sinh variants từ tổ hợp các thuộc tính
  useEffect(() => {
    if (watchedOptions && watchedOptions.length > 0) {
      const validOptions = watchedOptions.filter(
        (option) => option.name && option.values && option.values.filter(Boolean).length > 0
      )

      if (validOptions.length > 0) {
        const combinations = generateCombinations(validOptions)
        const newVariants = combinations.map((combo) => ({
          name: Object.values(combo).join(' - '),
          attributes: combo,
          price: 50000,
          stock: 100
        }))
        setValue('variants', newVariants)
      }
    }
  }, [watchedOptions, setValue])

  const generateCombinations = (options: any[]) => {
    if (options.length === 0) return []

    const result: { [key: string]: string }[] = []

    const generate = (index: number, current: { [key: string]: string }) => {
      if (index === options.length) {
        result.push({ ...current })
        return
      }

      const option = options[index]
      const validValues = option.values.filter(Boolean)

      for (const value of validValues) {
        current[option.name] = value
        generate(index + 1, current)
      }
    }

    generate(0, {})
    return result
  }

  const onSubmit = (data: ProductVariantForm) => {
    console.log('Form data:', data)
    toast({
      title: 'Thành công!',
      description: `Đã tạo ${data.variants.length} biến thể từ ${data.options.length} thuộc tính.`
    })
  }

  const addNewOption = () => {
    appendOption({
      id: Date.now().toString(),
      name: '',
      values: ['']
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Options Section */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium text-gray-700'>Thuộc tính sản phẩm</Label>
          <Button type='button' variant='outline' size='sm' onClick={addNewOption} className='flex items-center gap-2'>
            <Plus className='w-4 h-4' />
            Thêm thuộc tính
          </Button>
        </div>

        {optionFields.map((optionField, optionIndex) => (
          <OptionSection
            key={optionField.id}
            optionIndex={optionIndex}
            control={control}
            register={register}
            removeOption={removeOption}
            canRemove={optionFields.length > 1}
          />
        ))}
      </div>

      <Separator />

      {/* Variant Preview */}
      <VariantPreview variants={watch('variants') || []} />

      {/* Action Buttons */}
      <div className='flex gap-3 pt-4'>
        <Button type='submit' className='flex-1'>
          Lưu biến thể ({watch('variants')?.length || 0})
        </Button>
        <Button type='button' variant='outline' onClick={() => reset()} className='px-6'>
          Đặt lại
        </Button>
      </div>
    </form>
  )
}

const OptionSection = ({ optionIndex, control, register, removeOption, canRemove }: any) => {
  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue
  } = useFieldArray({
    control,
    name: `options.${optionIndex}.values`
  })

  return (
    <Card className='border border-gray-200'>
      <CardContent className='p-4'>
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Input
              {...register(`options.${optionIndex}.name`, {
                required: 'Tên thuộc tính là bắt buộc'
              })}
              placeholder='Tên thuộc tính (VD: Màu sắc, Kích thước...)'
              className='flex-1'
            />
            {canRemove && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => removeOption(optionIndex)}
                className='text-red-500 hover:text-red-700 hover:bg-red-50'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs text-gray-600'>Giá trị thuộc tính</Label>
              <Button type='button' variant='ghost' size='sm' onClick={() => appendValue('')} className='text-xs'>
                <Plus className='w-3 h-3 mr-1' />
                Thêm giá trị
              </Button>
            </div>

            {valueFields.map((valueField, valueIndex) => (
              <div key={valueField.id} className='flex items-center gap-2'>
                <GripVertical className='w-3 h-3 text-gray-400' />
                <Input
                  {...register(`options.${optionIndex}.values.${valueIndex}`, {
                    required: 'Giá trị không được để trống'
                  })}
                  placeholder='Nhập giá trị...'
                  className='flex-1 h-8 text-sm'
                />
                {valueFields.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeValue(valueIndex)}
                    className='h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const VariantPreview = ({ variants }: { variants: Omit<ProductVariant, 'id'>[] }) => {
  if (!variants || variants.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        <p className='text-sm'>Chưa có biến thể nào được tạo</p>
        <p className='text-xs mt-1'>Thêm thuộc tính và giá trị để tự động tạo biến thể</p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <Label className='text-sm font-medium text-gray-700'>Xem trước biến thể ({variants.length})</Label>
      <div className='grid gap-2 max-h-60 overflow-y-auto'>
        {variants.map((variant, index) => (
          <Card key={index} className='border border-gray-200'>
            <CardContent className='p-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-6 h-6 rounded bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300' />
                  <div>
                    <span className='font-medium text-sm'>{variant.name}</span>
                    <div className='flex gap-2 mt-1'>
                      {Object.entries(variant.attributes).map(([key, value]) => (
                        <span key={key} className='text-xs bg-gray-100 px-2 py-1 rounded'>
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-4 text-xs text-gray-600'>
                  <span>Giá: {variant.price.toLocaleString()}₫</span>
                  <span>Kho: {variant.stock}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default VariantForm
