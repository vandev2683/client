import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeClosed, PlusCircle, Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn, formatRoleName, formatUserStatus, handleError } from '@/lib/utils'
import { CreateUserBodySchema, type CreateUserBodyType } from '@/schemaValidations/user.schema'
import { useUploadImagesMutation } from '@/queries/useMedia'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from '@radix-ui/react-icons'
import { Calendar } from '@/components/ui/calendar'
import { UserStatusValues } from '@/constants/user'
import { useAllRolesQuery } from '@/queries/useRole'
import { useCreateUserMutation } from '@/queries/useUser'
import { Badge } from '@/components/ui/badge'

export default function AddUser() {
  const [file, setFile] = useState<File | null>(null)
  const [open, setOpen] = useState(false)
  const [inputType, setInputType] = useState<'text' | 'password'>('password')
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const rolesQuery = useAllRolesQuery()
  const roles = rolesQuery.data?.data.data || []

  const form = useForm<CreateUserBodyType>({
    resolver: zodResolver(CreateUserBodySchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phoneNumber: '',
      avatar: null,
      dateOfBirth: null,
      status: 'Active',
      roleId: roles.length > 0 ? roles[0].id : undefined
    }
  })
  const image = form.watch('avatar')
  const name = form.watch('name')
  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return image
  }, [file, image])

  const reset = () => {
    setOpen((prep) => !prep)
    setFile(null)
    form.reset()
  }

  const uploadImageMutation = useUploadImagesMutation()
  const createUserMutation = useCreateUserMutation()

  const onSubmit = async (body: CreateUserBodyType) => {
    if (createUserMutation.isPending) return
    try {
      if (file) {
        const formData = new FormData()
        formData.append('files', file)
        const uploadResult = await uploadImageMutation.mutateAsync(formData)
        body = {
          ...body,
          avatar: uploadResult.data.data[0].url
        }
      }
      await createUserMutation.mutateAsync(body)
      reset()
      toast.success('Thêm người dùng thành công')
    } catch (error) {
      handleError(error, form.setError)
    }
  }

  return (
    <Dialog onOpenChange={() => reset()} open={open}>
      <DialogTrigger asChild>
        <Button size='sm' className='h-7 gap-1 p-4'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Thêm người dùng</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[750px] max-h-screen overflow-auto' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Thêm người dùng</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8 z-50'
            id='add-user-form'
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error)
            })}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name'>Avatar</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <div className='flex gap-2 items-start justify-start'>
                          <Avatar className='aspect-square w-[120px] h-[100px] rounded-md object-contain relative overflow-visible'>
                            <AvatarImage src={previewAvatarFromFile ?? undefined} className='rounded-md' />
                            <AvatarFallback className='rounded-md'>{'Avatar'}</AvatarFallback>
                            {file && (
                              <Badge
                                className='h-5 min-w-5 rounded-full px-1 font-mono tabular-nums absolute bg-white text-black -top-2 -right-2 z-50 border border-gray-300 cursor-pointer'
                                onClick={() => {
                                  setFile(null)
                                  field.onChange(null)
                                }}
                              >
                                x
                              </Badge>
                            )}
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
                      <Label htmlFor='name'>Họ và tên</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='name' className='w-full' {...field} placeholder='Tên người dùng...' />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='email'>Email</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='email' className='w-full' {...field} placeholder='Email...' />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='password'>Mật khẩu</Label>
                      <div className='col-span-3 w-full space-y-2 relative'>
                        <Input id='password' className='w-full' {...field} type={inputType} placeholder='••••••' />
                        {inputType === 'password' ? (
                          <EyeClosed
                            className='absolute right-2 top-2/5 -translate-y-1/2 h-4 w-4 cursor-pointer'
                            onClick={() => {
                              setInputType((prev) => (prev === 'text' ? 'password' : 'text'))
                            }}
                          />
                        ) : (
                          <Eye
                            className='absolute right-2 top-2/5 -translate-y-1/2 h-4 w-4 cursor-pointer'
                            onClick={() => {
                              setInputType((prev) => (prev === 'text' ? 'password' : 'text'))
                            }}
                          />
                        )}
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='phoneNumber'>Số điện thoại</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input
                          id='phoneNumber'
                          className='w-full'
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            field.onChange(value)
                          }}
                          placeholder='Số điện thoại...'
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='dateOfBirth'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='dateOfBirth'>Ngày sinh</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <div className='grid grid-cols-12 gap-1'>
                          <div className='col-span-11 w-full space-y-2'>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className='w-auto p-0' align='start'>
                                <Calendar
                                  mode='single'
                                  selected={field.value ?? undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                  captionLayout='dropdown'
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </div>
                          <div className='col-span-1 w-full'>
                            <Button type='button' className='cursor-pointer' onClick={() => field.onChange(null)}>
                              x
                            </Button>
                          </div>
                        </div>
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
                            {UserStatusValues.map((val) => (
                              <SelectItem key={val} value={val}>
                                {formatUserStatus(val)}
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
                name='roleId'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='roleId'>Vai trò</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(Number(val))
                          }}
                          defaultValue={field.value?.toString() ?? ''}
                        >
                          <FormControl id='roleId'>
                            <SelectTrigger className='w-[50%]'>
                              <SelectValue placeholder='Chọn vai trò' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {formatRoleName(role.name)}
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
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='add-user-form'>
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
