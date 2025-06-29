import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { handleError } from '@/lib/utils'
import { useUploadImagesMutation } from '@/queries/useMedia'
import { useCreateProductMutation } from '@/queries/useManageProduct'
import ImageUpload from '@/components/ImageUpload'
import { CreateProductBodySchema, type CreateProductBodyType } from '@/schemaValidations/product.schema'
import { useAllCategoriesQuery } from '@/queries/useCategory'
import { useAllTagsQuery } from '@/queries/useTag'
import { ProductSatusValues } from '@/constants/product'
import { MultiAsyncSelect } from '@/components/MultiSelect'
import TinyEditor from '@/components/TinyEditor'
import { Separator } from '@/components/ui/separator'
import VariantsConfig from '@/components/VariantsConfig'
import VariantsList from '@/components/VariantsList'

export default function AddProduct() {
  const [open, setOpen] = useState(true)
  const [files, setFiles] = useState<(File | string)[]>([])

  const form = useForm<CreateProductBodyType>({
    resolver: zodResolver(CreateProductBodySchema),
    defaultValues: {
      name: '',
      description: '',
      images: [],
      status: 'Pending',
      variantsConfig: [
        {
          type: 'default',
          options: ['default']
        }
      ],
      categories: [],
      tags: [],
      variants: [
        {
          value: 'default',
          price: 0,
          stock: 0,
          thumbnail: null
        }
      ]
    }
  })

  const variantsConfig = form.watch('variantsConfig')

  const reset = () => {
    setOpen((prep) => !prep)
    form.reset()
    setFiles([])
  }

  const categoriesQuery = useAllCategoriesQuery()
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [filteredCategories, setFilteredCategories] = useState<{ id: number; name: string }[]>([])
  useEffect(() => {
    if (categoriesQuery.data) {
      const data = categoriesQuery.data.data.data
      setCategories(data.map((category) => ({ id: category.id, name: category.name })))
      setFilteredCategories(data.map((category) => ({ id: category.id, name: category.name })))
    }
  }, [categoriesQuery.data])

  const tagsQuery = useAllTagsQuery()
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])
  const [filteredTags, setFilteredTags] = useState<{ id: number; name: string }[]>([])
  useEffect(() => {
    if (tagsQuery.data) {
      const data = tagsQuery.data.data.data
      setTags(data.map((tag) => ({ id: tag.id, name: tag.name })))
      setFilteredTags(data.map((tag) => ({ id: tag.id, name: tag.name })))
    }
  }, [tagsQuery.data])

  const uploadImagesMutation = useUploadImagesMutation()
  const createProductMutation = useCreateProductMutation()

  const onSubmit = async (body: CreateProductBodyType) => {
    if (createProductMutation.isPending) return
    try {
      let uploadedImageUrls: string[] = []
      const newFiles = files.filter((file) => file instanceof File)

      if (newFiles.length > 0) {
        const formData = new FormData()
        for (const file of newFiles) {
          formData.append('files', file)
        }
        const uploadResult = await uploadImagesMutation.mutateAsync(formData)
        uploadedImageUrls = uploadResult.data.data.map((url) => url.url)
      }

      body = {
        ...body,
        images: uploadedImageUrls
      }

      console.log(body)
      // await createProductMutation.mutateAsync(body)
      // reset()
      toast.success('Thêm sản phẩm thành công')
    } catch (error) {
      handleError(error, form.setError)
    }
  }

  return (
    <Dialog onOpenChange={() => reset()} open={open}>
      <DialogTrigger asChild>
        <Button size='sm' className='h-7 gap-1 p-4'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Thêm sản phẩm</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[750px] max-h-screen overflow-auto' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8 z-50'
            id='add-product-form'
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error)
            })}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='images'
                render={() => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name'>Ảnh minh họa</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <ImageUpload files={files} setFiles={setFiles} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name'>Tên sản phẩm</Label>
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
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='status'>Trạng thái</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl id='status'>
                            <SelectTrigger className='w-[50%]'>
                              <SelectValue placeholder='Chọn trạng thái' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ProductSatusValues.map((val) => (
                              <SelectItem key={val} value={val}>
                                {val}
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
                name='categories'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='categories'>Danh mục</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <MultiAsyncSelect
                          id='categories'
                          placeholder='Chọn danh mục'
                          options={filteredCategories.map((category) => ({
                            label: category.name,
                            value: category.id.toString()
                          }))}
                          onValueChange={field.onChange}
                          className='w-full shadow-sm scroll-auto'
                          onSearch={(e) => {
                            const categoriesByName = categories.filter((category) =>
                              category.name.toLowerCase().includes(e.toLowerCase())
                            )
                            setFilteredCategories(categoriesByName)
                          }}
                          async
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='tags'>Thẻ</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <MultiAsyncSelect
                          id='tags'
                          placeholder='Chọn thẻ'
                          options={filteredTags.map((category) => ({
                            label: category.name,
                            value: category.id.toString()
                          }))}
                          onValueChange={field.onChange}
                          className='w-full shadow-sm scroll-auto'
                          onSearch={(e) => {
                            const tagsByName = tags.filter((tag) => tag.name.toLowerCase().includes(e.toLowerCase()))
                            setFilteredTags(tagsByName)
                          }}
                          async
                        />
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
                      <Label htmlFor='description'>Mô tả sản phẩm</Label>
                      <div className='col-span-3 w-full space-y-2 '>
                        <TinyEditor value={field.value} onChange={field.onChange} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <Separator />
              <FormField
                control={form.control}
                name='variantsConfig'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='variantsConfig'>Tạo biến thể</Label>
                      <div className='col-span-3 w-full space-y-2 '>
                        <VariantsConfig variantsConfig={field.value} setVariantsConfig={field.onChange} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <Separator />
              <FormField
                control={form.control}
                name='variants'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label className='text-sm font-medium'>Danh sách biến thể</Label>
                      <div className='col-span-3 w-full space-y-2 '>
                        <VariantsList
                          variantsConfig={variantsConfig}
                          variants={field.value}
                          setVariants={field.onChange}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter className='flex items-center gap-4'>
          <div className='flex items-center justify-between px-4 py-2 bg-blue-100 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Package className='w-5 h-5 text-blue-600' />
              <span className='font-medium text-gray-900'>Tổng: {form.getValues('variants').length} biến thể</span>
            </div>
          </div>
          <Button type='submit' form='add-product-form'>
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
