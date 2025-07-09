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
import { cn, handleError } from '@/lib/utils'
import EditUser from './EditUser'
import AddUser from './AddUser'
import type { UserWithRoleType } from '@/schemaValidations/user.schema'
import { useAllUsersQuery, useChangeUserStatusMutation, useDeleteUserMutation } from '@/queries/useUser'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { UserStatusValues, type UserStatusType } from '@/constants/user'
import ChangePassword from './ChangePassword'

const UserContext = createContext<{
  userIdEdit: number | undefined
  setUserIdEdit: (id: number | undefined) => void
  userChangePassword: UserWithRoleType | null
  setUserChangePassword: (user: UserWithRoleType | null) => void
  userDelete: UserWithRoleType | null
  setUserDelete: (user: UserWithRoleType | null) => void
}>({
  userIdEdit: undefined,
  setUserIdEdit: (id: number | undefined) => {},
  userChangePassword: null,
  setUserChangePassword: (user: UserWithRoleType | null) => {},
  userDelete: null,
  setUserDelete: (user: UserWithRoleType | null) => {}
})

export const columns: ColumnDef<UserWithRoleType>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div className='ml-4'>{row.getValue('email')}</div>
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
    cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>
  },
  {
    accessorKey: 'roleId',
    header: 'Vai trò',
    cell: function Convert({ row }) {
      const roleName = row.original.role.name
      return <div>{roleName}</div>
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: function ChangeStatus({ row }) {
      const changeUserStatusMutation = useChangeUserStatusMutation()

      const handleChangeStatus = async (value: UserStatusType) => {
        if (changeUserStatusMutation.isPending) return

        try {
          const payload = {
            userId: row.original.id,
            body: {
              status: value
            }
          }
          await changeUserStatusMutation.mutateAsync(payload)
          toast.success('Cập nhật trạng thái người dùng thành công')
        } catch (error) {
          handleError(error)
        }
      }

      const status = row.getValue('status') as UserStatusType
      let classNameStatus =
        'capitalize bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300'
      if (status === 'Inactive') {
        classNameStatus =
          'bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300'
      } else if (status === 'Blocked') {
        classNameStatus =
          'bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300'
      }

      return (
        <>
          <Select onValueChange={handleChangeStatus} defaultValue={status}>
            <SelectTrigger
              className='w-0 p-0 h-0 border-none shadow-none hover:shadow-none focus:shadow-none'
              hasIcon={false}
            >
              <span className={cn([classNameStatus, 'cursor-pointer'])}>{row.getValue('status')}</span>
            </SelectTrigger>

            <SelectContent>
              {UserStatusValues.map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
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
      const { setUserIdEdit, setUserChangePassword, setUserDelete } = useContext(UserContext)
      const openUserEdit = () => {
        setTimeout(() => {
          setUserIdEdit(row.original.id)
        }, 0)
      }
      const openChangePassword = () => {
        setTimeout(() => {
          setUserChangePassword(row.original)
        }, 0)
      }
      const openUserDelete = () => {
        setTimeout(() => {
          setUserDelete(row.original)
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
            <DropdownMenuItem onClick={openUserEdit}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openChangePassword}>Đổi mật khẩu</DropdownMenuItem>
            <DropdownMenuItem onClick={openUserDelete}>Xóa</DropdownMenuItem>
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
      const email = (row.original.email ?? '').toLowerCase()
      const name = (row.original.name ?? '').toLowerCase()
      const query = value.toLowerCase()
      return email.includes(query) || name.includes(query)
    },
    enableColumnFilter: true
  }
]

function AlertDialogUserDelete({
  userDelete,
  setUserDelete
}: {
  userDelete: UserWithRoleType | null
  setUserDelete: (user: UserWithRoleType | null) => void
}) {
  const deleteUserMutation = useDeleteUserMutation()

  const handleDelete = async () => {
    if (deleteUserMutation.isPending) return
    try {
      if (userDelete?.id) {
        await deleteUserMutation.mutateAsync(userDelete.id)
        setUserDelete(null)
        toast.success('Xóa người dùng thành công')
      }
    } catch (error) {
      handleError(error)
    }
  }
  return (
    <AlertDialog
      open={Boolean(userDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setUserDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa thẻ?</AlertDialogTitle>
          <AlertDialogDescription>
            Người dùng <span className='bg-foreground text-primary-foreground rounded px-1'>{userDelete?.email}</span>{' '}
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
export default function UserTable() {
  const navigate = useNavigate()

  const query = useQuery()
  const page = query.get('page') ? Number(query.get('page')) : 1

  const [userIdEdit, setUserIdEdit] = useState<number | undefined>()
  const [userChangePassword, setUserChangePassword] = useState<UserWithRoleType | null>(null)
  const [userDelete, setUserDelete] = useState<UserWithRoleType | null>(null)

  const usersQuery = useAllUsersQuery()
  const data = usersQuery.data?.data.data || []

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
    <UserContext.Provider
      value={{ userIdEdit, setUserIdEdit, userChangePassword, setUserChangePassword, userDelete, setUserDelete }}
    >
      <div className='w-full'>
        <EditUser id={userIdEdit} setId={setUserIdEdit} />
        <ChangePassword userChangePassword={userChangePassword} setUserChangePassword={setUserChangePassword} />
        <AlertDialogUserDelete userDelete={userDelete} setUserDelete={setUserDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Lọc tên người dùng, email...'
            value={(table.getColumn('search')?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              table.getColumn('search')?.setFilterValue(event.target.value)
              table.setPageIndex(0)
              navigate(`/manage/users`)
            }}
            className='max-w-sm'
          />
          <div className='ml-2 flex gap-2'></div>
          <div className='ml-auto flex items-center gap-2'>
            <AddUser />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={header.id === 'email' ? 'pl-6' : ''}>
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
              pathname='/manage/users'
            />
          </div>
        </div>
      </div>
    </UserContext.Provider>
  )
}
