import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { handleError } from '@/lib/utils'
import TinyEditor from '@/components/TinyEditor'
import { CreateCategoryBodySchema, type CreateCategoryBodyType } from '@/schemaValidations/category.schema'
import { useAllCategoriesQuery, useCreateCategoryMutation } from '@/queries/useCategory'

export default function AddCategory() {
  const [open, setOpen] = useState(false)
  const form = useForm<CreateCategoryBodyType>({
    resolver: zodResolver(CreateCategoryBodySchema),
    defaultValues: {
      name: '',
      parentCategoryId: 'null',
      description: ''
    }
  })

  const reset = () => {
    setOpen((prep) => !prep)
    form.reset()
  }

  const categoriesQuery = useAllCategoriesQuery()
  const categories = categoriesQuery.data?.data.data || []

  const createCategoryMutation = useCreateCategoryMutation()

  const onSubmit = async (body: CreateCategoryBodyType) => {
    if (createCategoryMutation.isPending) return
    try {
      if (body.parentCategoryId === 'null') {
        body.parentCategoryId = null
      } else {
        body.parentCategoryId = Number(body.parentCategoryId)
      }
      await createCategoryMutation.mutateAsync(body)
      reset()
      toast('Created category successfully')
    } catch (error) {
      handleError(error, form.setError)
    }
  }

  return (
    <Dialog onOpenChange={() => reset()} open={open}>
      <DialogTrigger asChild>
        <Button size='sm' className='h-7 gap-1 p-4'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Thêm danh mục</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[750px] max-h-screen overflow-auto' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Thêm danh mục</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8 z-50'
            id='add-dish-form'
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
                      <Label htmlFor='type'>Loại danh mục cha</Label>
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
                        >
                          <FormControl id='type'>
                            <SelectTrigger className='w-[50%]'>
                              <SelectValue placeholder='Chọn loại danh mục cha' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key={0} value={'null'}>
                              Không có
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
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
                      <div className='col-span-3 w-full space-y-2 '>
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
          <Button type='submit' form='add-dish-form'>
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
