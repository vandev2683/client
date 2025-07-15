import { Button } from '@/components/ui/button'
import { OrderStatus, OrderType } from '@/constants/order'
import { PaymentMethod } from '@/constants/payment'
import { useQuery } from '@/hooks/useQuery'
import { formatCurrency, formatDateTimeToLocaleString, handleError } from '@/lib/utils'
import { useCreatePaymentLinkMutation } from '@/queries/usePayment'
import { useGetOrdersProfileQuery } from '@/queries/useProfile'
import classNames from 'classnames'
import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createSearchParams, Link } from 'react-router'
import OrderDetail from './OrderDetail'

const orderTabs = [
  { status: 'All', name: 'Tất cả', type: [OrderType.Delivery, OrderType.DineIn] },
  { status: OrderStatus.Pending, name: 'Chờ xác nhận', type: [OrderType.Delivery, OrderType.DineIn] },
  { status: OrderStatus.Confirmed, name: 'Xác nhận', type: [OrderType.Delivery, OrderType.DineIn] },
  { status: OrderStatus.OutForDelivery, name: 'Đang giao', type: [OrderType.Delivery] },
  { status: OrderStatus.Preparing, name: 'Đang chuẩn bị', type: [OrderType.DineIn] },
  { status: OrderStatus.Ready, name: 'Sẵn sàng', type: [OrderType.DineIn] },
  { status: OrderStatus.Served, name: 'Đã phục vụ', type: [OrderType.DineIn] },
  { status: OrderStatus.Completed, name: 'Hoàn thành', type: [OrderType.Delivery, OrderType.DineIn] },
  { status: OrderStatus.Cancelled, name: 'Đã hủy', type: [OrderType.Delivery, OrderType.DineIn] }
]

export default function OrderHistory({ orderType }: { orderType: keyof typeof OrderType }) {
  const query = useQuery()
  const status = query.get('status') || 'All'

  const ordersQuery = useGetOrdersProfileQuery()
  const orders = ordersQuery.data?.data.data || []

  const filteredOrders = useMemo(() => {
    if (status === 'All') {
      return orders.filter((order) => order.orderType === orderType)
    }
    return orders.filter((order) => order.orderType === orderType && order.status === status)
  }, [orders, orderType, status])

  const purchaseTabsLink = orderTabs
    .filter((tab) => tab.type.includes(orderType))
    .map((tab) => (
      <Link
        key={tab.status}
        to={{
          pathname: `/profile/orders-history/${orderType === OrderType.Delivery ? 'online' : 'dine-in'}`,
          search: createSearchParams({
            status: String(tab.status)
          }).toString()
        }}
        className={classNames('flex flex-1 items-center justify-center border-b-2 bg-white py-4 text-center', {
          'border-b-primary text-priborder-b-primary': status === tab.status,
          'border-b-black/10 text-gray-900': status !== tab.status
        })}
      >
        {tab.name}
      </Link>
    ))

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
    <div>
      <div className='overflow-x-auto'>
        <div className='min-w-[700px]'>
          <div className='sticky top-0 flex rounded-t-sm shadow-sm'>{purchaseTabsLink}</div>
          <div>
            {filteredOrders?.map((order) => (
              <div
                key={order.id}
                className='mt-4 rounded-sm border-black/10 bg-white p-6 text-gray-800 shadow-sm flex items-center justify-between'
              >
                <div className='flex w-[70%] items-center gap-6'>
                  <div>
                    <OrderDetail order={order}>
                      <Button variant='ghost'>
                        <Eye className='w-4 h-4' />
                      </Button>
                    </OrderDetail>
                  </div>
                  <div>
                    <h2 className='text-sm'>Đơn hàng #{order.id}</h2>
                    <div className='text-xs text-gray-500 mb-2 flex flex-col gap-1'>
                      {Object.entries(
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
                  <span
                    className={classNames('text-xs font-medium me-2 px-2.5 py-0.5 rounded-full', {
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300':
                        order.status === OrderStatus.Pending,
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300':
                        order.status === OrderStatus.Confirmed,
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300':
                        order.status === OrderStatus.Preparing,
                      'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-300':
                        order.status === OrderStatus.Ready,
                      'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300':
                        order.status === OrderStatus.OutForDelivery,
                      'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-300':
                        order.status === OrderStatus.Served,
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300':
                        order.status === OrderStatus.Completed,
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300':
                        order.status === OrderStatus.Cancelled
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
    </div>
  )
}
