import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect } from 'react'
import { handleError } from '@/lib/utils'
import { toast } from 'sonner'
import TinyEditor from '@/components/TinyEditor'
import { UpdateCategoryBodySchema, type UpdateCategoryBodyType } from '@/schemaValidations/category.schema'
import { useAllCategoriesQuery, useCategoryDetailQuery, useUpdateCategoryMutation } from '@/queries/useCategory'

export default function EditCategory({
  id,
  setId,
  onSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSuccess?: () => void
}) {
  const form = useForm<UpdateCategoryBodyType>({
    resolver: zodResolver(UpdateCategoryBodySchema),
    defaultValues: {
      name: '',
      parentCategoryId: 'null',
      description: ''
    }
  })

  const reset = () => {
    setId(undefined)
    form.reset()
  }

  const categoryDetailQuery = useCategoryDetailQuery(id)
  useEffect(() => {
    if (categoryDetailQuery.data) {
      const { name, parentCategoryId, description } = categoryDetailQuery.data.data
      form.reset({
        name,
        parentCategoryId: parentCategoryId ? parentCategoryId.toString() : 'null',
        description
      })
    }
  }, [categoryDetailQuery.data, form])

  const categoriesQuery = useAllCategoriesQuery()
  const categories = categoriesQuery.data?.data.data || []

  const updateCategoryMutation = useUpdateCategoryMutation()
  const onSubmit = async (body: UpdateCategoryBodyType) => {
    if (updateCategoryMutation.isPending) return
    try {
      if (body.parentCategoryId === 'null') {
        body.parentCategoryId = null
      } else {
        body.parentCategoryId = Number(body.parentCategoryId)
      }
      const payload = {
        categoryId: id as number,
        body
      }
      await updateCategoryMutation.mutateAsync(payload)
      reset()
      toast.success('Cập nhật danh mục thành công')
    } catch (error) {
      handleError(error, form.setError)
    }
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          setId(undefined)
        }
      }}
    >
      <DialogContent className='sm:max-w-[750px] max-h-screen overflow-auto' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Cập nhật danh mục</DialogTitle>
          <DialogDescription>Các trường sau đây là bắt buộc: Tên</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-dish-form'
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error)
            })}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name'>Tên danh mục</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='name' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='parentCategoryId'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='type'>Loại danh mục</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select
                          onValueChange={(e) => {
                            if (e === 'null') {
                              field.onChange(null)
                              return
                            }
                            field.onChange(Number(e))
                          }}
                          defaultValue={field.value?.toString()}
                          value={form.getValues('parentCategoryId')?.toString()}
                        >
                          <FormControl id='type'>
                            <SelectTrigger className='w-[50%]'>
                              <SelectValue placeholder='Chọn loại danh mục' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key={0} value={'null'}>
                              Không có
                            </SelectItem>
                            {categories
                              .filter((category) => category.id !== id)
                              .map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='description'>Mô tả thẻ</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <TinyEditor value={field.value} onChange={field.onChange} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='edit-dish-form'>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
