import { useEffect, useState, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { CreateReviewBodySchema, type CreateReviewBodyType, type ReviewType } from '@/schemaValidations/review.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Star } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  useCreateReviewMutation,
  useReviewWithProductAndOrderQuery,
  useUpdateReviewMutation
} from '@/queries/useReview'
import { handleError } from '@/lib/utils'
import { toast } from 'sonner'

export default function OrderDetail({
  productId,
  orderId,
  children
}: {
  orderId: number
  productId: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [reviewExists, setReviewExists] = useState<ReviewType | null>(null)
  const [isDisabled, setIsDisabled] = useState(false)

  const [hoveredStar, setHoveredStar] = useState<number>(0)

  const form = useForm<CreateReviewBodyType>({
    resolver: zodResolver(CreateReviewBodySchema),
    defaultValues: {
      orderId: orderId,
      productId: productId,
      rating: 0,
      content: ''
    }
  })

  const rating = form.watch('rating')

  const reviewQuery = useReviewWithProductAndOrderQuery(productId, orderId)
  useEffect(() => {
    if (reviewQuery.data !== undefined && reviewQuery.data.data) {
      const { content, rating, productId, orderId } = reviewQuery.data.data
      form.reset({
        content: content,
        rating: rating,
        productId: productId,
        orderId: orderId
      })
      setReviewExists(reviewQuery.data.data)
      setIsDisabled(reviewQuery.data.data.isEdited)
    }
  }, [reviewQuery.data, form])

  const handleStarClick = (starValue: number) => {
    form.setValue('rating', starValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow empty input
    if (inputValue === '') {
      form.setValue('rating', 0)
      return
    }

    // Only process if it's a valid number
    const numValue = Number.parseFloat(inputValue)
    if (!isNaN(numValue)) {
      // Automatically clamp values between 0 and 5
      let clampedValue = numValue
      if (numValue < 0) {
        clampedValue = 0
      } else if (numValue > 5) {
        clampedValue = 5
      }

      form.setValue('rating', clampedValue)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isFilled = starValue <= (hoveredStar || rating)
      const isPartiallyFilled = !hoveredStar && rating > index && rating < starValue

      return (
        <button
          key={index}
          type='button'
          className='relative focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded cursor-pointer'
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(0)}
          disabled={isDisabled}
        >
          <Star
            className={`w-8 h-8 transition-colors duration-150 ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
            }`}
          />
          {isPartiallyFilled && (
            <Star
              className='absolute top-0 left-0 w-8 h-8 fill-yellow-400 text-yellow-400'
              style={{
                clipPath: `inset(0 ${100 - (rating - index) * 100}% 0 0)`
              }}
            />
          )}
        </button>
      )
    })
  }

  const createReviewMutation = useCreateReviewMutation()
  const updateReviewMutation = useUpdateReviewMutation()
  const onSubmit = async (body: CreateReviewBodyType) => {
    if (createReviewMutation.isPending || updateReviewMutation.isPending) return
    try {
      if (reviewExists === null) {
        await createReviewMutation.mutateAsync(body)

        toast.success('Đánh giá đã được gửi thành công!')
      } else {
        await updateReviewMutation.mutateAsync({
          reviewId: reviewExists.id,
          body: {
            content: body.content,
            rating: body.rating,
            productId: body.productId,
            orderId: body.orderId
          }
        })
        toast.success('Đánh giá đã được cập nhật thành công!')
      }
      form.reset()
      setOpen(false)
    } catch (error) {
      handleError(error, form.setError)
    }
  }

  if (!orderId || !productId) return <div className='text-red-500'>Đơn hàng không tồn tại.</div>
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className=''>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>Đánh giá sản phẩm</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8 z-50'
            id='add-edit-review-form'
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error)
            })}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='rating'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='rating'>Đánh giá</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <div className='space-y-2 flex items-center gap-5'>
                          <div className='flex '>{renderStars()}</div>
                          <span>or</span>
                          <div className='flex flex-col items-center gap-1'>
                            <Input
                              id='rating-input'
                              type='number'
                              min='0'
                              max='5'
                              step='0.1'
                              value={field.value.toString()}
                              onChange={handleInputChange}
                              className='w-full'
                              placeholder='Nhập số từ 0.0 đến 5.0'
                              disabled={isDisabled}
                            />
                            <span className='text-xs font-semibold'>0.0 - 5.0</span>
                          </div>
                        </div>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='content'>Nội dung</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Textarea
                          id='content'
                          className='w-full'
                          {...field}
                          placeholder='Đánh giá thêm nếu hài lòng...'
                          disabled={isDisabled}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
          <span className='text-sm text-gray-600'>Note: Đánh giá chỉ cho phép sửa một lần duy nhất</span>
          {reviewExists ? (
            !reviewExists.isEdited && (
              <Button type='submit' form='add-edit-review-form'>
                Cập nhật
              </Button>
            )
          ) : (
            <Button type='submit' form='add-edit-review-form'>
              Gửi
            </Button>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
