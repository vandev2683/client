import { Button } from '@/components/ui/button'
import { OrderStatus, OrderType } from '@/constants/order'
import { PaymentMethod } from '@/constants/payment'
import { useQuery } from '@/hooks/useQuery'
import { formatCurrency, formatDateTimeToLocaleString, handleError } from '@/lib/utils'
import { useCreatePaymentLinkMutation } from '@/queries/usePayment'
import classNames from 'classnames'
import { Eye } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import OrderDetail from './OrderDetail'
import { useProfileOrdersQuery } from '@/queries/useProfile'
import { orderSocket, reviewSocket } from '@/lib/sockets'
import { useAppContext } from '@/components/AppProvider'

export default function OrderHistory({ orderType }: { orderType: keyof typeof OrderType }) {
  const { isAuth } = useAppContext()
  const query = useQuery()
  const status = query.get('status') || 'All'

  const { data, refetch } = useProfileOrdersQuery()
  const orders = data?.data.orders || []

  useEffect(() => {
    if (isAuth) {
      reviewSocket.connect()
      orderSocket.connect()
    } else {
      reviewSocket.disconnect()
      orderSocket.disconnect()
      return
    }

    reviewSocket.on('recieved-review', (data: { message: string }) => {
      setTimeout(() => {
        refetch()
      }, 10)
    })

    orderSocket.on('changed-order-status', (data: { message: string }) => {
      setTimeout(() => {
        refetch()
      }, 10)
    })

    return () => {
      reviewSocket.off('recieved-review')
      orderSocket.off('changed-order-status')
      reviewSocket.disconnect()
      orderSocket.disconnect()
    }
  }, [isAuth, refetch])

  const filteredOrders = useMemo(() => {
    if (status === 'All') {
      return orders.filter((order) => order.orderType === orderType)
    }
    return orders.filter((order) => order.orderType === orderType && order.status === status)
  }, [orders, orderType, status])

  const createPaymentLink = useCreatePaymentLinkMutation()
  const handlePaymentAgain = async (orderId: number) => {
    if (createPaymentLink.isPending) return
    try {
      const result = await createPaymentLink.mutateAsync({ orderId })
      window.location.href = result.data.url
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <div className='overflow-x-auto'>
      <div className='min-w-[700px]'>
        <div>
          {filteredOrders?.map((order) => (
            <div
              key={order.id}
              className='mt-4 rounded-sm border-black/10 bg-white p-6 text-gray-800 shadow-sm flex items-center justify-between'
            >
              <div className='flex w-[55%] items-center gap-6'>
                <div>
                  <OrderDetail order={order}>
                    <Button variant='ghost'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </OrderDetail>
                </div>
                <div>
                  <h2 className='text-sm'>Đơn hàng #{order.id}</h2>
                  <div className='text-xs text-gray-500 mb-2 flex flex-col gap-1 min-w-[120px] max-w-[180px]'>
                    {/* {Object.entries(
                      order.orderItems.reduce(
                        (acc, item) => {
                          if (!acc[item.productName]) {
                            acc[item.productName] = []
                          }
                          acc[item.productName].push(`${item.variantValue} x${item.quantity}`)
                          return acc
                        },
                        {} as Record<string, string[]>
                      )
                    ).map(([productName, variants]) => (
                      <span key={productName}>
                        {productName}: {variants.join(', ')}
                      </span>
                    ))} */}
                    {order.orderItems.map((item, index) => (
                      <span
                        key={index}
                        className='overflow-hidden text-ellipsis whitespace-nowrap [&>*]:inline [&>*]:whitespace-nowrap [&>*]:overflow-hidden [&>*]:text-ellipsis'
                        title={item.productName}
                      >
                        {item.productName}
                      </span>
                    ))}
                  </div>
                </div>
                {order.orderType === OrderType.Delivery && order.deliveryAddress && (
                  <div className='text-xs text-gray-500 mb-2 flex flex-col gap-1'>
                    <p>
                      {order.deliveryAddress.recipientName} / {order.deliveryAddress.recipientPhone}
                    </p>
                    <p></p>
                    <p
                      className='truncate w-[200px]'
                      title={`${order.deliveryAddress.detailAddress}, ${order.deliveryAddress.ward.name}, ${order.deliveryAddress.district.name}, ${order.deliveryAddress.province.name}`}
                    >
                      Địa chỉ: {order.deliveryAddress.detailAddress},{' '}
                      {order.deliveryAddress.ward.name && `${order.deliveryAddress.ward.name}, `}
                      {order.deliveryAddress.district.name}, {order.deliveryAddress.province.name}
                    </p>
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <span
                  className={classNames('text-xs font-medium me-2 px-2.5 py-0.5 rounded-full', {
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300':
                      order.status === OrderStatus.Pending,
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300':
                      order.status === OrderStatus.Confirmed,
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300':
                      order.status === OrderStatus.Preparing,
                    'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-300': order.status === OrderStatus.Ready,
                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300':
                      order.status === OrderStatus.OutForDelivery,
                    'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-300':
                      order.status === OrderStatus.Served,
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300':
                      order.status === OrderStatus.Completed,
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': order.status === OrderStatus.Cancelled
                  })}
                >
                  {order.status}
                </span>
              </div>
              <div className='flex flex-1 items-center'>
                <div>
                  <p className='text-xs'>Ngày đặt: {formatDateTimeToLocaleString(order.createdAt)}</p>
                  <p className='text-xs'>
                    Thanh toán: {order.payment.paymentMethod}
                    {order.payment.paidAt ? ' - ' + formatDateTimeToLocaleString(order.payment.paidAt) : ''}
                  </p>
                  <p className='mt-2'>
                    Tổng tiền:{' '}
                    <span className='text-lg font-semibold text-primary'>{formatCurrency(order.finalAmount)}</span>
                  </p>
                </div>
                {(order.payment.paymentMethod === PaymentMethod.MOMO ||
                  order.payment.paymentMethod === PaymentMethod.VNPay) &&
                  order.payment.paidAt === null && (
                    <Button
                      type='button'
                      variant='outline'
                      className='cursor-pointer border-primary'
                      onClick={() => handlePaymentAgain(order.id)}
                    >
                      Thanh toán
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
