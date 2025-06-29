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
import { Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useMemo, useRef, useState } from 'react'
import { UpdateTagBodySchema, type UpdateTagBodyType } from '@/schemaValidations/tag.schema'
import { handleError } from '@/lib/utils'
import { TagTypeValues } from '@/constants/tag'
import { toast } from 'sonner'
import TinyEditor from '@/components/TinyEditor'
import { useTagDetailQuery, useUpdateTagMutation } from '@/queries/useTag'

export default function EditTag({
  id,
  setId,
  onSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSuccess?: () => void
}) {
  // const [file, setFile] = useState<File | null>(null)
  // const imageInputRef = useRef<HTMLInputElement | null>(null)
  const form = useForm<UpdateTagBodyType>({
    resolver: zodResolver(UpdateTagBodySchema),
    defaultValues: {
      name: '',
      type: 'Custom',
      description: ''
    }
  })
  // const image = form.watch('image')
  const name = form.watch('name')
  // const previewAvatarFromFile = useMemo(() => {
  //   if (file) {
  //     return URL.createObjectURL(file)
  //   }
  //   return image
  // }, [file, image])

  const reset = () => {
    setId(undefined)
    // setFile(null)
    form.reset()
  }

  const tagDetailQuery = useTagDetailQuery(id)
  useEffect(() => {
    if (tagDetailQuery.data) {
      const { name, type, description } = tagDetailQuery.data.data
      form.reset({
        name,
        type,
        description
      })
    }
  }, [tagDetailQuery.data, form])

  // const uploadImageMutation = useUploadImageMutation()
  const updateTagMutation = useUpdateTagMutation()
  const onSubmit = async (body: UpdateTagBodyType) => {
    if (updateTagMutation.isPending) return
    try {
      const payload = {
        tagId: id as number,
        body
      }
      // if (file) {
      //   const formData = new FormData()
      //   formData.append('file', file)
      //   const uploadResult = await uploadImageMutation.mutateAsync(formData)
      //   data.body = {
      //     ...data.body,
      //     image: uploadResult.payload.data
      //   }
      // }
      await updateTagMutation.mutateAsync(payload)
      reset()
      toast.success('Cập nhật thẻ thành công')
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
          <DialogTitle>Cập nhật thẻ</DialogTitle>
          <DialogDescription>Các trường sau đây là bắt buộc: Tên, loại thẻ</DialogDescription>
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
              {/* <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex gap-2 items-start justify-start'>
                      <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className='rounded-none'>{name || 'Avatar'}</AvatarFallback>
                      </Avatar>
                      <input
                        type='file'
                        accept='image/*'
                        ref={imageInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            field.onChange('http://localhost:3000/' + file.name)
                          }
                        }}
                        className='hidden'
                      />
                      <button
                        className='flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed'
                        type='button'
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name'>Tên thẻ</Label>
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
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='type'>Loại thẻ</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={form.getValues('type')}
                        >
                          <FormControl id='type'>
                            <SelectTrigger className='w-[50%]'>
                              <SelectValue placeholder='Chọn loại thẻ' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TagTypeValues.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
