import type { ProductType } from '@/schemaValidations/product.schema'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AutoPagination from '@/components/AutoPagination'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { cn, formatCurrency, handleError } from '@/lib/utils'
import AddProduct from './AddProduct'
import { ProductStatusValues, type ProductStatusType } from '@/constants/product'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import {
  useAllProductsQuery,
  useChangeProductStatusMutation,
  useDeleteProductMutation
} from '@/queries/useManageProduct'
import Config from '@/constants/config'
import EditProduct from './EditProduct'

const ProductContext = createContext<{
  productIdEdit: number | undefined
  setProductIdEdit: (id: number | undefined) => void
  productDelete: ProductType | null
  setProductDelete: (product: ProductType | null) => void
}>({
  productIdEdit: undefined,
  setProductIdEdit: (id: number | undefined) => {},
  productDelete: null,
  setProductDelete: (product: ProductType | null) => {}
})

export const columns: ColumnDef<ProductType>[] = [
  {
    accessorKey: 'images',
    header: 'Thumbnail',
    cell: ({ row }) => {
      const images = row.getValue('images') as string[]
      if (!images || images.length === 0) {
        return (
          <img
            src={Config.ImageBaseUrl}
            alt={row.getValue('name') as string}
            className='w-24 h-24 object-cover rounded-md ml-4'
          />
        )
      }
      return (
        <img src={images[0]} alt={row.getValue('name') as string} className='w-24 h-24 object-cover rounded-md ml-4' />
      )
    }
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'basePrice',
    header: 'Price',
    cell: ({ row }) => <div>{formatCurrency(row.getValue('basePrice') as number)}</div>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: function ChangeStatus({ row }) {
      const changeProductStatusMutation = useChangeProductStatusMutation()

      const handleChangeStatus = async (value: ProductStatusType) => {
        if (changeProductStatusMutation.isPending) return

        try {
          const payload = {
            productId: row.original.id,
            body: {
              status: value
            }
          }
          await changeProductStatusMutation.mutateAsync(payload)
          toast.success('Cập nhật trạng thái sản phẩm thành công')
        } catch (error) {
          handleError(error)
        }
      }

      const status = row.original.status
      let classNameStatus =
        'capitalize bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300'
      if (status === 'OutOfStock') {
        classNameStatus =
          'bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300'
      } else if (status === 'Pending') {
        classNameStatus =
          'bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300'
      } else if (status === 'Hidden') {
        classNameStatus =
          'bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300'
      }

      return (
        <>
          <Select onValueChange={handleChangeStatus} defaultValue={status}>
            <SelectTrigger
              className='w-0 p-0 h-0 border-none shadow-none hover:shadow-none focus:shadow-none'
              hasIcon={false}
            >
              <span className={cn([classNameStatus, 'cursor-pointer'])}>{row.original.status}</span>
            </SelectTrigger>

            <SelectContent>
              {ProductStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setProductIdEdit, setProductDelete } = useContext(ProductContext)
      const openProductEdit = () => {
        setTimeout(() => {
          setProductIdEdit(row.original.id)
        }, 0)
      }
      const openProductDelete = () => {
        setTimeout(() => {
          setProductDelete(row.original)
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
            <DropdownMenuItem onClick={openProductEdit}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openProductDelete}>Xóa</DropdownMenuItem>
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
      const name = (row.original.name || '').toLowerCase()
      const description = (row.original.description || '').toLowerCase()
      const query = value.toLowerCase()
      return name.includes(query) || description.includes(query)
    },
    enableColumnFilter: true
  }
]

function AlertDialogproductDelete({
  productDelete,
  setProductDelete
}: {
  productDelete: ProductType | null
  setProductDelete: (value: ProductType | null) => void
}) {
  const deleteProductMutation = useDeleteProductMutation()

  const handleDelete = async () => {
    if (deleteProductMutation.isPending) return
    try {
      if (productDelete?.id) {
        await deleteProductMutation.mutateAsync(productDelete.id)
        setProductDelete(null)
        toast.success('Xóa sản phẩm thành công')
      }
    } catch (error) {
      handleError(error)
    }
  }
  return (
    <AlertDialog
      open={Boolean(productDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setProductDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
          <AlertDialogDescription>
            Sản phẩm <span className='bg-foreground text-primary-foreground rounded px-1'>{productDelete?.name}</span>
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
export default function ProductTable() {
  const navigate = useNavigate()

  const query = useQuery()
  const page = query.get('page') ? Number(query.get('page')) : 1

  const [productIdEdit, setProductIdEdit] = useState<number | undefined>()
  const [productDelete, setProductDelete] = useState<ProductType | null>(null)

  const productsQuery = useAllProductsQuery()
  const data = productsQuery.data?.data.data || []

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
    data,
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
    <ProductContext.Provider value={{ productIdEdit, setProductIdEdit, productDelete, setProductDelete }}>
      <div className='w-full'>
        <EditProduct id={productIdEdit} setId={setProductIdEdit} />
        <AlertDialogproductDelete productDelete={productDelete} setProductDelete={setProductDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên, mô tả...'
            value={(table.getColumn('search')?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              table.getColumn('search')?.setFilterValue(event.target.value)
              table.setPageIndex(0)
              navigate(`/manage/products`)
            }}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddProduct />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={header.id === 'images' ? 'pl-6' : ''}>
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
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong <strong>{data.length}</strong>{' '}
            kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/products'
            />
          </div>
        </div>
      </div>
    </ProductContext.Provider>
  )
}
