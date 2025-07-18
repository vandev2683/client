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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AutoPagination from '@/components/AutoPagination'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { formatTableStatus, getHtmlPlainTextTitle, handleError } from '@/lib/utils'
import EditTable from './EditTable'
import AddTable from './AddTable'
import type { TableType } from '@/schemaValidations/table.schema'
import { useAllTablesQuery, useChangeTableStatusMutation, useDeleteTableMutation } from '@/queries/useTable'
import { TableStatus, TableStatusValues, type TableStatusType } from '@/constants/table'
import classNames from 'classnames'
import { tableSocket } from '@/lib/sockets'
import type { MessageResType } from '@/schemaValidations/response.schema'
import { useAppContext } from '@/components/AppProvider'

const TableContext = createContext<{
  tableIdEdit: number | undefined
  setTableIdEdit: (id: number | undefined) => void
  tableDelete: TableType | null
  setTableDelete: (table: TableType | null) => void
}>({
  tableIdEdit: undefined,
  setTableIdEdit: (id: number | undefined) => {},
  tableDelete: null,
  setTableDelete: (table: TableType | null) => {}
})

export const columns: ColumnDef<TableType>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => <div className='capitalize ml-4'>{row.getValue('code')}</div>
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('capacity')}</div>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: function ChangeStatus({ row }) {
      const changeTableStatusMutation = useChangeTableStatusMutation()

      const handleChangeStatus = async (value: TableStatusType) => {
        if (changeTableStatusMutation.isPending) return

        try {
          const payload = {
            tableId: row.original.id,
            body: {
              status: value
            }
          }
          await changeTableStatusMutation.mutateAsync(payload)
          toast.success('Cập nhật trạng thái bàn ăn thành công')
        } catch (error) {
          handleError(error)
        }
      }

      const status = row.original.status
      return (
        <>
          <Select onValueChange={handleChangeStatus} defaultValue={status}>
            <SelectTrigger
              className='w-0 p-0 h-0 border-none shadow-none hover:shadow-none focus:shadow-none'
              hasIcon={false}
            >
              <span
                className={classNames('text-xs font-medium me-2 px-2.5 py-0.5 rounded-full capitalize cursor-pointer', {
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': status === TableStatus.Available,
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': status === TableStatus.Disabled,
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300':
                    status === TableStatus.Reserved,
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': status === TableStatus.Occupied,
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': status === TableStatus.Cleaning
                })}
              >
                {formatTableStatus(status)}
              </span>
            </SelectTrigger>

            <SelectContent>
              {TableStatusValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {formatTableStatus(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )
    }
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const location = row.getValue('location') as string
      const plainTextTitle = getHtmlPlainTextTitle(location)
      return (
        <div className='max-w-[300px]'>
          <div
            dangerouslySetInnerHTML={{ __html: location }}
            className='overflow-hidden text-ellipsis whitespace-nowrap [&>*]:inline [&>*]:whitespace-nowrap [&>*]:overflow-hidden [&>*]:text-ellipsis'
            title={plainTextTitle}
          />
        </div>
      )
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setTableIdEdit, setTableDelete } = useContext(TableContext)
      const openTableEdit = () => {
        setTimeout(() => {
          setTableIdEdit(row.original.id)
        }, 0)
      }
      const openTableDelete = () => {
        setTimeout(() => {
          setTableDelete(row.original)
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
            <DropdownMenuItem onClick={openTableEdit}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openTableDelete}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogTagDelete({
  tableDelete,
  setTableDelete
}: {
  tableDelete: TableType | null
  setTableDelete: (value: TableType | null) => void
}) {
  const deleteTableMutation = useDeleteTableMutation()

  const handleDelete = async () => {
    if (deleteTableMutation.isPending) return
    try {
      if (tableDelete?.id) {
        await deleteTableMutation.mutateAsync(tableDelete.id)
        setTableDelete(null)
        toast.success('Xóa bàn ăn thành công')
      }
    } catch (error) {
      handleError(error)
    }
  }
  return (
    <AlertDialog
      open={Boolean(tableDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setTableDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa bàn ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Bàn ăn{' '}
            <span className='bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-sm dark:bg-red-900 dark:text-red-300'>
              {tableDelete?.code}
            </span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const PAGE_SIZE = 10
export default function TableTable() {
  const { isAuth } = useAppContext()
  const navigate = useNavigate()

  const query = useQuery()
  const page = query.get('page') ? Number(query.get('page')) : 1
  const statusFilter = query.get('status') || ''

  const [tableIdEdit, setTableIdEdit] = useState<number | undefined>()
  const [tableDelete, setTableDelete] = useState<TableType | null>(null)

  const { data: tables, refetch } = useAllTablesQuery()
  const data = tables?.data.data || []

  useEffect(() => {
    if (isAuth) {
      tableSocket.connect()
    } else {
      tableSocket.disconnect()
      return
    }

    tableSocket.on('sended-table', (data: MessageResType) => {
      setTimeout(() => {
        refetch()
      }, 10)
    })

    return () => {
      tableSocket.off('sended-table')
      tableSocket.disconnect()
    }
  }, [isAuth, refetch])

  // Filter data based on query parameters
  const filteredData = data.filter((table) => {
    const matchesStatus = !statusFilter || table.status === statusFilter
    return matchesStatus
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
    <TableContext.Provider value={{ tableIdEdit, setTableIdEdit, tableDelete, setTableDelete }}>
      <div className='w-full'>
        <EditTable id={tableIdEdit} setId={setTableIdEdit} />
        <AlertDialogTagDelete tableDelete={tableDelete} setTableDelete={setTableDelete} />
        <div className='flex items-center py-4 gap-4'>
          <Input
            placeholder='Lọc mã bàn ăn...'
            value={(table.getColumn('code')?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              table.getColumn('code')?.setFilterValue(event.target.value)
              table.setPageIndex(0)
              navigate(`/manage/tables`)
            }}
            className='max-w-sm'
          />

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
              navigate(`/manage/tables?${params.toString()}`)
            }}
          >
            <SelectTrigger className='max-w-sm'>
              <span>{statusFilter ? formatTableStatus(statusFilter as TableStatusType) : 'Tất cả trạng thái'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả trạng thái</SelectItem>
              {TableStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatTableStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='ml-auto flex items-center gap-2'>
            <AddTable />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={header.id === 'code' ? 'pl-6' : ''}>
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
              pathname='/manage/tables'
            />
          </div>
        </div>
      </div>
    </TableContext.Provider>
  )
}
