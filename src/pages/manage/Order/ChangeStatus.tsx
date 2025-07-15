import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { OrderStatus, OrderStatusValues, type OrderStatusType } from '@/constants/order'
import { handleError } from '@/lib/utils'
import { useChangeOrderStatusMutation } from '@/queries/useOrder'
import type { GetOrderDetailResType } from '@/schemaValidations/order.schema'
import classNames from 'classnames'
import { toast } from 'sonner'

export default function ChangeStatus({ order }: { order: GetOrderDetailResType }) {
  const changeOrderStatusMutation = useChangeOrderStatusMutation()

  const handleChangeStatus = async (value: OrderStatusType) => {
    if (changeOrderStatusMutation.isPending) return

    try {
      const payload = {
        orderId: order.id,
        body: {
          status: value
        }
      }
      await changeOrderStatusMutation.mutateAsync(payload)
      toast.success('Cập nhật trạng thái đơn hàng thành công')
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <Select onValueChange={handleChangeStatus} defaultValue={order.status}>
      <SelectTrigger
        className='p-0 w-19 border-none shadow-none hover:shadow-none focus:shadow-none flex'
        hasIcon={false}
      >
        <span
          className={classNames('text-xs font-medium me-2 px-2.5 py-0.5 rounded-full', {
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300':
              order.status === OrderStatus.Pending,
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': order.status === OrderStatus.Confirmed,
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': order.status === OrderStatus.Preparing,
            'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-300': order.status === OrderStatus.Ready,
            'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300':
              order.status === OrderStatus.OutForDelivery,
            'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-300':
              order.status === OrderStatus.Served,
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': order.status === OrderStatus.Completed,
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': order.status === OrderStatus.Cancelled
          })}
        >
          {order.status}
        </span>
      </SelectTrigger>

      <SelectContent>
        {OrderStatusValues.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
