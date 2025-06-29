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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from '@radix-ui/react-icons'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useEffect } from 'react'
import { cn, handleError } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import TinyEditor from '@/components/TinyEditor'
import { UpdateCouponBodySchema, type UpdateCouponBodyType } from '@/schemaValidations/coupon.schema'
import { useCouponDetailQuery, useUpdateCouponMutation } from '@/queries/useCoupon'
import { UpdateRoleBodySchema, type UpdateRoleBodyType } from '@/schemaValidations/role.schema'
import { useRoleDetailQuery, useUpdateRoleMutation } from '@/queries/useRole'
import { useAllPermissionsQuery } from '@/queries/usePermission'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import type { PermissionType } from '@/schemaValidations/permission.schema'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function EditRole({
  id,
  setId,
  onSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSuccess?: () => void
}) {
  const form = useForm<UpdateRoleBodyType>({
    resolver: zodResolver(UpdateRoleBodySchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      permissionIds: []
    }
  })

  const reset = () => {
    setId(undefined)
    form.reset()
  }

  const permissionsQuery = useAllPermissionsQuery()
  const permissions = permissionsQuery.data?.data.data || []
  const groupedPermissionsByModule = permissions.reduce<Record<string, PermissionType[]>>((acc, cur) => {
    ;(acc[cur.module] ??= []).push(cur)
    return acc
  }, {})
  const permissionsKeys = Object.keys(groupedPermissionsByModule).filter((key) => key !== '')
  const roleDetailQuery = useRoleDetailQuery(id)
  useEffect(() => {
    if (roleDetailQuery.data) {
      const { name, description, isActive, permissions } = roleDetailQuery.data.data
      form.reset({
        name,
        description,
        isActive,
        permissionIds: permissions.map((permission) => permission.id)
      })
    }
  }, [roleDetailQuery.data, form])

  const updateRoleMutation = useUpdateRoleMutation()
  const onSubmit = async (body: UpdateRoleBodyType) => {
    if (updateRoleMutation.isPending) return
    try {
      const payload = {
        roleId: id as number,
        body
      }
      await updateRoleMutation.mutateAsync(payload)
      reset()
      toast.success('Cập nhật vai trò và quyền hạn thành công')
    } catch (error) {
      handleError(error, form.setError)
      reset()
    }
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[750px] max-h-screen overflow-auto' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Cập nhật vai trò và quyền hạn</DialogTitle>
          <DialogDescription>Các trường sau đây là bắt buộc: Tên, trạng thái, danh sách quyền hạn</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-role-form'
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
                      <Label htmlFor='name'>Tên vai trò</Label>
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
                name='isActive'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='isActive'>Trạng thái</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <RadioGroup
                          defaultValue={field.value ? 'active' : 'inactive'}
                          onValueChange={(e) => {
                            const val = e === 'active' ? true : false
                            field.onChange(val)
                          }}
                          value={field.value ? 'active' : 'inactive'}
                        >
                          <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='active' id='active' />
                            <Label htmlFor='active'>Kích hoạt ngay</Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='inactive' id='inactive' />
                            <Label htmlFor='inactive'>Chưa kích hoạt</Label>
                          </div>
                        </RadioGroup>
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
                      <Label htmlFor='description'>Mô tả</Label>
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
                name='permissionIds'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='permissionIds'>Danh sách quyền hạn</Label>
                      <div className='col-span-3 w-full space-y-2 '>
                        <Accordion type='single' collapsible className='w-full' defaultValue={permissionsKeys[0]}>
                          {permissionsKeys.map((key) => {
                            return (
                              <AccordionItem key={key} value={key}>
                                <AccordionTrigger className='capitalize'>{key.toLowerCase()}</AccordionTrigger>
                                <AccordionContent className='flex flex-col gap-4 text-balance'>
                                  {groupedPermissionsByModule[key].map((permission) => {
                                    return (
                                      <FormItem key={permission.id} className='flex flex-row items-center gap-2'>
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(permission.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, permission.id])
                                                : field.onChange(
                                                    field.value?.filter((value) => value !== permission.id)
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className='text-sm font-normal'>{permission.name}</FormLabel>
                                      </FormItem>
                                    )
                                  })}
                                </AccordionContent>
                              </AccordionItem>
                            )
                          })}

                          <FormMessage />
                        </Accordion>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='edit-role-form'>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
