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
                <div className='flex flex-1 items-center gap-10'>
                  <div>
                    <OrderDetail order={order}>
                      <Button variant='ghost'>
                        <Eye className='w-4 h-4' />
                      </Button>
                    </OrderDetail>
                  </div>
                  <h2 className='text-sm'>Đơn hàng #{order.id}</h2>
                  <span
                    className={classNames('text-xs font-medium me-2 px-2.5 py-0.5 rounded-full', {
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300':
                        order.status === OrderStatus.Pending,
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300':
                        order.status === OrderStatus.Confirmed,
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300':
                        order.status === OrderStatus.Completed,
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300':
                        order.status === OrderStatus.OutForDelivery,
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300':
                        order.status === OrderStatus.Cancelled
                    })}
                  >
                    {order.status}
                  </span>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='flex flex-col items-end gap-2'>
                    <div>
                      {order.payment.paymentMethod}
                      {order.payment.paidAt ? ' - ' + formatDateTimeToLocaleString(order.payment.paidAt) : ''}
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
                  <div>
                    <span className='text-xs'>Ngày đặt: {formatDateTimeToLocaleString(order.createdAt)}</span>
                    <p className='mt-2'>
                      Tổng tiền:{' '}
                      <span className='text-lg font-semibold text-primary'>{formatCurrency(order.finalAmount)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
