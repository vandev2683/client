'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { RegisterBodySchema, type RegisterBodyType, type SendOTPBodyType } from '@/schemaValidations/auth.schema'
import { useGetGoogleLinkQuery, useRegisterMutation, useSendOTPMutation } from '@/queries/useAuth'
import { handleError } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppContext } from '@/components/AppProvider'
import { useState, useEffect } from 'react'
import { Eye, EyeClosed } from 'lucide-react'
import { VerificationCode } from '@/constants/auth'

export default function Register() {
  const { setProfile } = useAppContext()

  const [inputType, setInputType] = useState<'text' | 'password'>('password')
  const [countdown, setCountdown] = useState(0)

  const form = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBodySchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      code: '',
      password: '',
      confirmPassword: ''
    }
  })

  const sendOTPMutation = useSendOTPMutation()
  const handleSendOTP = async () => {
    if (sendOTPMutation.isPending || countdown > 0) return
    try {
      const email = form.getValues('email')
      if (!email) {
        form.setError('email', { type: 'manual', message: 'Email is required' })
        return
      }

      const body: SendOTPBodyType = {
        email: email,
        type: VerificationCode.Register
      }

      await sendOTPMutation.mutateAsync(body)
      setCountdown(60)
      toast.success('OTP đã được gửi đến email của bạn', {
        duration: 2000,
        position: 'bottom-right'
      })
    } catch (error) {
      handleError(error, form.setError)
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown])

  const registerMutation = useRegisterMutation()
  const onSubmit = async (data: RegisterBodyType) => {
    if (registerMutation.isPending) return
    try {
      const result = await registerMutation.mutateAsync(data)
      setProfile(result.data.user)
      toast.success('Đăng ký thành công', {
        duration: 2000,
        position: 'bottom-right'
      })
    } catch (error) {
      console.error('Login error:', error)
      handleError(error, form.setError)
    }
  }

  const googleLinkQuery = useGetGoogleLinkQuery()
  const handleLoginWithGoogle = async () => {
    if (googleLinkQuery.isPending) return
    try {
      const result = await googleLinkQuery.data?.data
      if (result) {
        window.location.href = result.url
      }
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <Card className='mx-auto w-full max-w-sm mt-10'>
      <CardHeader>
        <CardTitle className='text-2xl'>Đăng ký</CardTitle>
        <CardDescription>Nhập tên, số điện thoại, email và mật khẩu của bạn để đăng ký vào hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {' '}
          <form
            className='space-y-4 w-full'
            noValidate
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error)
            })}
          >
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='name'>Name</Label>
                      <Input id='name' type='text' placeholder='Nguyen Van A' required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='phoneNumber'>Phone</Label>
                      <Input
                        id='phoneNumber'
                        type='text'
                        placeholder='0123456789'
                        required
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '') // Chỉ cho phép số
                          field.onChange(value)
                        }}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        type='email'
                        placeholder='m@example.com'
                        required
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          if (e.target.value) {
                            form.clearErrors('email')
                          }
                        }}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='code'>OTP Code</Label>

                      <div className='flex gap-1'>
                        <Input
                          id='code'
                          type='text'
                          required
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            if (value.length > 6) {
                              return
                            }
                            field.onChange(value)
                          }}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          className='col-span-1'
                          onClick={handleSendOTP}
                          disabled={countdown > 0 || sendOTPMutation.isPending}
                        >
                          {countdown > 0 ? `${countdown}s` : 'Send OTP'}
                        </Button>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <div className='flex items-center'>
                        <Label htmlFor='password'>Password</Label>
                      </div>
                      <div className='w-full relative'>
                        <Input id='password' className='w-full' {...field} type={inputType} />
                        {inputType === 'password' ? (
                          <EyeClosed
                            className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer'
                            style={{ top: '50%' }}
                            onClick={() => {
                              setInputType((prev) => (prev === 'text' ? 'password' : 'text'))
                            }}
                          />
                        ) : (
                          <Eye
                            className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer'
                            style={{ top: '50%' }}
                            onClick={() => {
                              setInputType((prev) => (prev === 'text' ? 'password' : 'text'))
                            }}
                          />
                        )}
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <div className='flex items-center'>
                        <Label htmlFor='confirmPassword'>Confirm Password</Label>
                      </div>
                      <div className='w-full relative'>
                        <Input id='confirmPassword' className='w-full' {...field} type={inputType} />
                        {inputType === 'password' ? (
                          <EyeClosed
                            className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer'
                            style={{ top: '50%' }}
                            onClick={() => {
                              setInputType((prev) => (prev === 'text' ? 'password' : 'text'))
                            }}
                          />
                        ) : (
                          <Eye
                            className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer'
                            style={{ top: '50%' }}
                            onClick={() => {
                              setInputType((prev) => (prev === 'text' ? 'password' : 'text'))
                            }}
                          />
                        )}
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type='submit' className='w-full'>
                Đăng ký
              </Button>
              <Button type='button' variant='outline' className='w-full' onClick={handleLoginWithGoogle}>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                  <path
                    d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                    fill='currentColor'
                  />
                </svg>
                Đăng ký với Google
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
