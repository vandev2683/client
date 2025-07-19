import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Package, Clock, Star } from 'lucide-react'
import { formatCurrency, formatDateTimeToLocaleString } from '@/lib/utils'
import { PaymentMethod } from '@/constants/payment'
import Config from '@/constants/config'
import { CouponDiscountType } from '@/constants/coupon'
import { useOrderDetailQuery } from '@/queries/useOrder'
import ChangeStatus from './ChangeStatus'
import { orderSocket, reviewSocket } from '@/lib/sockets'
import { useEffect } from 'react'
import type { MessageResType } from '@/schemaValidations/response.schema'
import { useAppContext } from '@/components/AppProvider'

export default function OrderDetail({
  orderId,
  setOrderId
}: {
  orderId?: number | undefined
  setOrderId: (id: number | undefined) => void
}) {
  const { isAuth } = useAppContext()
  const { data, refetch } = useOrderDetailQuery(orderId)
  const order = data?.data

  useEffect(() => {
    if (isAuth) {
      reviewSocket.connect()
      orderSocket.connect()
    } else {
      reviewSocket.disconnect()
      orderSocket.disconnect()
      return
    }

    reviewSocket.on('recieved-review', (data: MessageResType) => {
      setTimeout(() => {
        refetch()
      }, 10)
    })

    orderSocket.on('changed-order-status', (data: { message: string }) => {
      setTimeout(() => {
        refetch()
      }, 10)
    })

    orderSocket.on('recieved-order-payment', (data: MessageResType) => {
      setTimeout(() => {
        refetch()
      }, 10)
    })

    return () => {
      orderSocket.off('recieved-review')
      orderSocket.off('changed-order-status')
      orderSocket.off('recieved-order-payment')
      orderSocket.disconnect()
      reviewSocket.disconnect()
    }
  }, [isAuth, refetch])

  if (!order) return null

  const productNameSet = new Set(order.orderItems.map((item) => item.productName))

  const renderStars = ({ rating, sizeIcon = 5 }: { rating: number; sizeIcon?: number }) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isFilled = starValue <= rating
      const isPartiallyFilled = rating > index && rating < starValue

      return (
        <button key={index} type='button' className='relative rounded'>
          <Star
            className={`w-${sizeIcon} h-${sizeIcon} transition-colors duration-150 ${
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
            }`}
          />
          {isPartiallyFilled && (
            <Star
              className={`absolute top-0 left-0 w-${sizeIcon} h-${sizeIcon} fill-yellow-400 text-yellow-400`}
              style={{
                clipPath: `inset(0 ${100 - (rating - index) * 100}% 0 0)`
              }}
            />
          )}
        </button>
      )
    })
  }

  if (!order.user || !order.deliveryAddress)
    return <div className='text-red-500'>Không tìm thấy thông tin đơn hàng.</div>
  return (
    <Dialog
      open={Boolean(orderId)}
      onOpenChange={() => {
        setOrderId(undefined)
      }}
    >
      <DialogContent className='min-w-[55vw] min-h-[80vh] max-h-[100vh] overflow-y-auto' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>Chi Tiết Đơn Hàng #{order.id}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Clock className='w-5 h-5 text-muted-foreground' />
                <h3 className='font-semibold'>Thông Tin Khách Hàng</h3>
              </div>
              <div className='flex flex-col items-start gap-3 p-4 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Avatar>
                    <AvatarImage src={order.user.avatar || ''} alt={order.customerName} />
                    <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <p className='font-medium'>{order.user.name}</p>
                    <p className='text-sm text-muted-foreground'>{order.user.email}</p>
                  </div>
                </div>
                <div className='text-sm text-gray-800'>
                  <h2>
                    Người nhận: <span className='font-semibold'>{order.deliveryAddress.recipientName}</span>
                  </h2>
                  <p>
                    Số điện thoại: <span className='font-semibold'>{order.deliveryAddress.recipientPhone}</span>
                  </p>
                  <p>
                    Địa chỉ: {order.deliveryAddress.detailAddress},{' '}
                    {order.deliveryAddress.ward.name && `${order.deliveryAddress.ward.name}, `}
                    {order.deliveryAddress.district.name}, {order.deliveryAddress.province.name}
                  </p>
                  <p>
                    Ghi chú: <span className='font-semibold'>{order.note ? order.note : '...'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Package className='w-5 h-5 text-muted-foreground' />
                <h3 className='font-semibold'>Trạng Thái Đơn Hàng</h3>
              </div>
              <div className='p-4 border rounded-lg space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Trạng thái:</span>
                  <ChangeStatus order={order} />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Ngày đặt:</span>
                  <span className='text-sm font-medium'>{formatDateTimeToLocaleString(order.createdAt)}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Phương thức thanh toán:</span>
                  <span className='text-sm font-medium'>{order.payment.paymentMethod}</span>
                </div>
                {(order.payment.paymentMethod === PaymentMethod.MOMO ||
                  order.payment.paymentMethod === PaymentMethod.VNPay) && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Mã thanh toán:</span>
                    <span className='text-sm font-medium'>{order.payment.transactionId}</span>
                  </div>
                )}
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Thời gian thanh toán:</span>
                  <span className='text-sm font-medium'>
                    {order.payment.paidAt ? formatDateTimeToLocaleString(order.payment.paidAt) : 'Chưa thanh toán'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Tổng tiền:</span>
                  <span className='text-md font-bold text-primary'>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col'>
                    <span className='text-sm text-muted-foreground'>Phí:</span>
                    <span className='text-sm text-muted-foreground'>({formatCurrency(30000)} Ship + 10% VAT)</span>
                  </div>
                  <span className='text-md font-bold text-primary'>{formatCurrency(order.feeAmount)}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Giảm giá:{' '}
                    {order.coupon
                      ? `(${order.coupon.discountType === CouponDiscountType.Amount ? `-${formatCurrency(order.coupon.discountValue)}` : `-${order.coupon.discountValue}%`})`
                      : ''}
                  </span>
                  <span className='text-md font-bold text-primary'>{formatCurrency(order.discountAmount)}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Thanh toán:</span>
                  <span className='text-lg font-bold text-primary'>{formatCurrency(order.finalAmount)}</span>
                </div>
                <span className='text-gray-800 text-xs'>
                  Note: Nếu giảm giá trên %, 10% VAT = Tổng tiền x % Giảm x 0.1
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bottom Section: Order Items Accordion */}
          <div className='space-y-4'>
            <h3 className='font-semibold flex items-center gap-2'>
              <Package className='w-5 h-5 text-muted-foreground' />
              Sản Phẩm Trong Đơn Hàng
            </h3>

            <Accordion type='single' collapsible className='space-y-2'>
              {Array.from(productNameSet).map((productName) => {
                const itemsForProduct = order.orderItems.filter((item) => item.productName === productName)
                const firstItem = itemsForProduct[0]

                return (
                  <AccordionItem key={productName} value={productName} className='border last:border-b rounded-lg px-4'>
                    <div className='flex items-center justify-between'>
                      <AccordionTrigger hasIcon={false}>
                        <div className='flex items-center gap-4 flex-1'>
                          <img
                            src={
                              (firstItem.variant && firstItem.variant.product?.images[0]) ||
                              firstItem.thumbnail ||
                              Config.ImageBaseUrl
                            }
                            alt={firstItem.productName}
                            className='w-12 h-12 rounded-md object-cover border'
                          />
                          <div className='flex-1 text-left'>
                            <p className='font-medium'>{firstItem.productName}</p>
                            <div className='flex items-center gap-4 text-sm text-muted-foreground font-normal'>
                              <span>Số lượng: {itemsForProduct.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      {order.reviews.some((review) => review.productId === firstItem.productId) && (
                        <div className='flex flex-col items-end gap-2'>
                          <span className='text-yellow-500'>
                            {renderStars({
                              rating:
                                order.reviews.find((review) => review.productId === firstItem.productId)?.rating || 0,
                              sizeIcon: 4
                            })}
                          </span>
                          {order.reviews.find((review) => review.productId === firstItem.productId)?.content && (
                            <p
                              className='text-sm text-gray-600 max-w-[350px] truncate'
                              title={
                                order.reviews.find((review) => review.productId === firstItem.productId)?.content || ''
                              }
                            >
                              Đánh giá:{' '}
                              {order.reviews.find((review) => review.productId === firstItem.productId)?.content || ''}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <AccordionContent className='pt-4'>
                      <div className='space-y-6'>
                        <div className='space-y-3'>
                          <h4 className='font-medium text-sm flex items-center gap-2'>
                            <Package className='w-4 h-4' />
                            Tùy Chọn Đã Mua:
                          </h4>
                          <div className='w-full flex flex-col gap-3'>
                            {itemsForProduct.map((item) => (
                              <div
                                key={item.id}
                                className='flex items-center justify-between p-3 bg-muted/60 rounded-md'
                              >
                                <div>
                                  <p className='text-sm font-medium'>{item.variantValue}</p>
                                  <p className='text-xs text-muted-foreground'>Số lượng: {item.quantity}</p>
                                </div>
                                <div className='text-right'>
                                  <p className='text-sm font-medium text-primary'>{formatCurrency(item.price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
