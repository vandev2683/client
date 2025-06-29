import type { TagType } from '@/schemaValidations/tag.schema'
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
import AddTag from './AddTag'
import EditTag from './EditTag'
import { useAllTagsQuery, useDeleteTagMutation } from '@/queries/useTag'
import { toast } from 'sonner'
import { handleError } from '@/lib/utils'

const TagContext = createContext<{
  tagIdEdit: number | undefined
  setTagIdEdit: (id: number | undefined) => void
  tagDelete: TagType | null
  setTagDelete: (tag: TagType | null) => void
}>({
  tagIdEdit: undefined,
  setTagIdEdit: (id: number | undefined) => {},
  tagDelete: null,
  setTagDelete: (tag: TagType | null) => {}
})

export const columns: ColumnDef<TagType>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='capitalize ml-4'>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('type')}</div>
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
      const { setTagIdEdit, setTagDelete } = useContext(TagContext)
      const openTagEdit = () => {
        setTimeout(() => {
          setTagIdEdit(row.original.id)
        }, 0)
      }
      const openTagDelete = () => {
        setTimeout(() => {
          setTagDelete(row.original)
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
            <DropdownMenuItem onClick={openTagEdit}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openTagDelete}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

function AlertDialogTagDelete({
  tagDelete,
  setTagDelete
}: {
  tagDelete: TagType | null
  setTagDelete: (value: TagType | null) => void
}) {
  const deleteTagMutation = useDeleteTagMutation()

  const handleDelete = async () => {
    if (deleteTagMutation.isPending) return
    try {
      if (tagDelete?.id) {
        await deleteTagMutation.mutateAsync(tagDelete.id)
        setTagDelete(null)
        toast.success('Xóa thẻ thành công')
      }
    } catch (error) {
      handleError(error)
    }
  }
  return (
    <AlertDialog
      open={Boolean(tagDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setTagDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa thẻ?</AlertDialogTitle>
          <AlertDialogDescription>
            Thẻ <span className='bg-foreground text-primary-foreground rounded px-1'>{tagDelete?.name}</span> sẽ bị xóa
            vĩnh viễn
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
export default function TagTable() {
  const navigate = useNavigate()

  const query = useQuery()
  const page = query.get('page') ? Number(query.get('page')) : 1

  const [tagIdEdit, setTagIdEdit] = useState<number | undefined>()
  const [tagDelete, setTagDelete] = useState<TagType | null>(null)

  const tagsQuery = useAllTagsQuery()
  const data = tagsQuery.data?.data.data || []

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
    <TagContext.Provider value={{ tagIdEdit, setTagIdEdit, tagDelete, setTagDelete }}>
      <div className='w-full'>
        <EditTag id={tagIdEdit} setId={setTagIdEdit} />
        <AlertDialogTagDelete tagDelete={tagDelete} setTagDelete={setTagDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên thẻ...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              table.getColumn('name')?.setFilterValue(event.target.value)
              table.setPageIndex(0)
              navigate(`/manage/tags?page=1`)
            }}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddTag />
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
              pathname='/manage/tags'
            />
          </div>
        </div>
      </div>
    </TagContext.Provider>
  )
}
