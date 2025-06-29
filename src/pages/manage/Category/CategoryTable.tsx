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
import { handleError } from '@/lib/utils'
import type { CategoryWithParentType } from '@/schemaValidations/category.schema'
import { useAllCategoriesQuery, useDeleteCategoryMutation } from '@/queries/useCategory'
import AddCategory from './AddCategory'
import EditCategory from './EditCategory'

const CategoryContext = createContext<{
  categoryIdEdit: number | undefined
  setCategoryIdEdit: (id: number | undefined) => void
  categoryDelete: CategoryWithParentType | null
  setCategoryDelete: (category: CategoryWithParentType | null) => void
}>({
  categoryIdEdit: undefined,
  setCategoryIdEdit: (id: number | undefined) => {},
  categoryDelete: null,
  setCategoryDelete: (category: CategoryWithParentType | null) => {}
})

export const columns: ColumnDef<CategoryWithParentType>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='capitalize ml-4'>{row.getValue('name')}</div>
  },
  {
    header: 'Category Parent',
    cell: ({ row }) => {
      const parentCategory = row.original.parentCategory as CategoryWithParentType | null
      if (!parentCategory) {
        return <div className='text-muted-foreground'>Không có</div>
      }
      return <div className='capitalize'>{parentCategory.name}</div>
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      const match = description.match(/<p[^>]*>.*?<\/p>/i)
      const briefDesc = match ? match[0] : description
      return <div dangerouslySetInnerHTML={{ __html: briefDesc }} className='whitespace-pre-line' />
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setCategoryIdEdit, setCategoryDelete } = useContext(CategoryContext)
      const openCategoryEdit = () => {
        setTimeout(() => {
          setCategoryIdEdit(row.original.id)
        }, 0)
      }
      const openCategoryDelete = () => {
        setTimeout(() => {
          setCategoryDelete(row.original)
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
            <DropdownMenuItem onClick={openCategoryEdit}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openCategoryDelete}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogTagDelete({
  categoryDelete,
  setCategoryDelete
}: {
  categoryDelete: CategoryWithParentType | null
  setCategoryDelete: (value: CategoryWithParentType | null) => void
}) {
  const deletCategoryMutation = useDeleteCategoryMutation()

  const handleDelete = async () => {
    if (deletCategoryMutation.isPending) return
    try {
      if (categoryDelete?.id) {
        await deletCategoryMutation.mutateAsync(categoryDelete.id)
        setCategoryDelete(null)
        toast.success('Xóa danh mục thành công')
      }
    } catch (error) {
      handleError(error)
    }
  }
  return (
    <AlertDialog
      open={Boolean(categoryDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setCategoryDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
          <AlertDialogDescription>
            Danh mục <span className='bg-foreground text-primary-foreground rounded px-1'>{categoryDelete?.name}</span>{' '}
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
export default function CategoryTable() {
  const navigate = useNavigate()

  const query = useQuery()
  const page = query.get('page') ? Number(query.get('page')) : 1

  const [categoryIdEdit, setCategoryIdEdit] = useState<number | undefined>()
  const [categoryDelete, setCategoryDelete] = useState<CategoryWithParentType | null>(null)

  const categoriesQuery = useAllCategoriesQuery()
  const data = categoriesQuery.data?.data.data || []

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
    <CategoryContext.Provider value={{ categoryIdEdit, setCategoryIdEdit, categoryDelete, setCategoryDelete }}>
      <div className='w-full'>
        <EditCategory id={categoryIdEdit} setId={setCategoryIdEdit} />
        <AlertDialogTagDelete categoryDelete={categoryDelete} setCategoryDelete={setCategoryDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên danh mục...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              table.getColumn('name')?.setFilterValue(event.target.value)
              table.setPageIndex(0)
              navigate(`/manage/categories?page=1`)
            }}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddCategory />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={header.id === 'name' ? 'pl-6' : ''}>
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
              pathname='/manage/categories'
            />
          </div>
        </div>
      </div>
    </CategoryContext.Provider>
  )
}
