import { createContext, useContext, useEffect, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState
} from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQuery } from '@/hooks/useQuery'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AutoPagination from '@/components/AutoPagination'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  formatCurrency,
  formatDateTimeToLocaleString,
  formatOrderStatus,
  formatOrderType,
  handleError
} from '@/lib/utils'
import { useAllOrdersQuery, useChangeOrderStatusMutation } from '@/queries/useOrder'
import { OrderStatus, OrderStatusValues, OrderType, OrderTypeValues, type OrderStatusType } from '@/constants/order'
import classNames from 'classnames'
import OrderDetail from './OrderDetail'
import type { OrderDetailType } from '@/schemaValidations/order.schema'
import type { MessageResType } from '@/schemaValidations/response.schema'
import { orderSocket } from '@/lib/sockets'
import { useAppContext } from '@/components/AppProvider'

const OrderContext = createContext<{
  orderId: number | undefined
  setOrderId: (id: number | undefined) => void
}>({
  orderId: undefined,
  setOrderId: () => {}
})

export const columns: ColumnDef<OrderDetailType>[] = [
  {
    accessorKey: 'id',
    header: 'Code',
    cell: ({ row }) => <div className='uppercase ml-4'>#{row.getValue('id')}</div>
  },
  {
    accessorKey: 'orderItems',
    header: 'Items',
    cell: ({ row }) => {
      return (
        <div>
          <div className='text-sm text-gray-800 mb-2 flex flex-col gap-1'>
            {Object.entries(
              row.original.orderItems.reduce(
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
              <span
                key={productName}
                className='max-w-[200px] truncate'
                title={`${productName}: ${variants.join(', ')}`}
              >
                {productName}: {variants.join(', ')}
              </span>
            ))}
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'deliveryAddress',
    header: 'Reciever',
    enableHiding: true,
    cell: ({ row }) => {
      const order = row.original
      if (order.orderType === OrderType.Delivery) {
        if (!order.deliveryAddress) {
          return <span className='text-gray-800'>{order.customerName}</span>
        } else {
          return (
            <div className='text-sm text-gray-800 mb-2 flex flex-col gap-1'>
              <p>
                {order.deliveryAddress.recipientName} / {order.deliveryAddress.recipientPhone}
              </p>
              <p></p>
              <p
                className='truncate max-w-[200px]'
                title={`${order.deliveryAddress.detailAddress}, ${order.deliveryAddress.ward.name}, ${order.deliveryAddress.district.name}, ${order.deliveryAddress.province.name}`}
              >
                Địa chỉ: {order.deliveryAddress.detailAddress},{' '}
                {order.deliveryAddress.ward.name && `${order.deliveryAddress.ward.name}, `}
                {order.deliveryAddress.district.name}, {order.deliveryAddress.province.name}
              </p>
            </div>
          )
        }
      } else {
        return <span className='text-gray-800'>{order.customerName}</span>
      }
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: function ChangeStatus({ row }) {
      const order = row.original
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
        <div>
          <Select onValueChange={handleChangeStatus} defaultValue={order.status} value={row.getValue('status')}>
            <SelectTrigger
              className='w-0 p-0 h-0 border-none shadow-none hover:shadow-none focus:shadow-none'
              hasIcon={false}
            >
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
                {formatOrderStatus(order.status)}
              </span>
            </SelectTrigger>

            <SelectContent>
              {OrderStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatOrderStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className='text-xs text-gray-800'>Loại: {formatOrderType(row.original.orderType)}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className='ml-16'>
          <p className='text-xs'>Ngày đặt: {formatDateTimeToLocaleString(order.createdAt)}</p>
          <p className='text-xs'>
            Thanh toán: {order.payment.paymentMethod}
            {order.payment.paidAt ? ' - ' + formatDateTimeToLocaleString(order.payment.paidAt) : ''}
          </p>
          <p className='mt-2'>
            Tổng tiền: <span className='text-lg font-semibold text-primary'>{formatCurrency(order.finalAmount)}</span>
          </p>
        </div>
      )
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setOrderId } = useContext(OrderContext)
      const openOrderDetail = () => {
        setTimeout(() => {
          setOrderId(row.original.id)
        }, 0)
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {row.original.userId ? (
              <DropdownMenuItem onClick={openOrderDetail}>Xem chi tiết</DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <span className='text-gray-500'>Người dùng đã xóa tài khoản</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  },
  {
    id: 'search',
    cell: () => null,
    enableHiding: true,
    filterFn: (row, columnId, value) => {
      const orderId = row.original.id.toString()
      const query = value.toLowerCase()
      return orderId.includes(query)
    },
    enableColumnFilter: true
  }
]

const PAGE_SIZE = 10
export default function OrderTable() {
  const { isAuth } = useAppContext()
  const navigate = useNavigate()

  const query = useQuery()
  const page = query.get('page') ? Number(query.get('page')) : 1
  const orderTypeFilter = query.get('orderType') || ''
  const statusFilter = query.get('status') || ''

  const [orderId, setOrderId] = useState<number | undefined>()

  const { data: orders, refetch } = useAllOrdersQuery()
  const data = orders?.data.data || []
  useEffect(() => {
    if (isAuth) {
      orderSocket.connect()
    } else {
      orderSocket.disconnect()
      return
    }

    orderSocket.on('recieved-order', (data: MessageResType) => {
      toast.success(data.message || 'Đã nhận đơn hàng mới')
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
      orderSocket.off('recieved-order')
      orderSocket.off('changed-order-status')
      orderSocket.off('recieved-order-payment')
      orderSocket.disconnect()
    }
  }, [isAuth, refetch])

  // Filter data based on query parameters
  const filteredData = data.filter((order) => {
    const matchesOrderType = !orderTypeFilter || order.orderType === orderTypeFilter
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesOrderType && matchesStatus
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const pageIndex = page - 1
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE
  })

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  return (
    <OrderContext.Provider value={{ orderId, setOrderId }}>
      <div className='w-full'>
        <OrderDetail orderId={orderId} setOrderId={setOrderId} />
        <div className='flex items-center py-4 gap-4'>
          <Input
            placeholder='Tìm theo mã đơn hàng...'
            value={(table.getColumn('search')?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              table.getColumn('search')?.setFilterValue(event.target.value)
              table.setPageIndex(0)
            }}
            className='max-w-sm'
          />

          <Select
            value={orderTypeFilter}
            onValueChange={(value) => {
              const params = new URLSearchParams(window.location.search)
              if (value && value !== 'all') {
                params.set('orderType', value)
              } else {
                params.delete('orderType')
              }
              params.delete('page') // Reset to first page
              navigate(`/manage/orders?${params.toString()}`)
            }}
          >
            <SelectTrigger className='max-w-sm'>
              <span>{formatOrderType(orderTypeFilter) || 'Tất cả loại đơn hàng'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả loại đơn hàng</SelectItem>
              {OrderTypeValues.map((type) => (
                <SelectItem key={type} value={type}>
                  {formatOrderType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              const params = new URLSearchParams(window.location.search)
              if (value && value !== 'all') {
                params.set('status', value)
              } else {
                params.delete('status')
              }
              params.delete('page') // Reset to first page
              navigate(`/manage/orders?${params.toString()}`)
            }}
          >
            <SelectTrigger className='max-w-sm'>
              <span>{formatOrderStatus(statusFilter) || 'Tất cả trạng thái'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả trạng thái</SelectItem>
              {OrderStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatOrderStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={classNames('', {
                          'pl-6': header.id === 'id',
                          'pl-18': header.id === 'payment'
                        })}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-xs text-muted-foreground py-4 flex-1 '>
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
            <strong>{filteredData.length}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/orders'
            />
          </div>
        </div>
      </div>
    </OrderContext.Provider>
  )
}
