import { Settings, ShoppingCart } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Link } from 'react-router'
import { ModeToggle } from '@/components/ModeToggle'
import { useAppContext } from '@/components/AppProvider'
import { clearLocalStorage, getFirstNameClient, getRefreshTokenFromLocalStorage, handleError } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { toast } from 'sonner'
import { useAllCartItemsQuery } from '@/queries/useCart'

export default function UserActions() {
  const { isAuth, profile, setProfile } = useAppContext()
  const refreshToken = getRefreshTokenFromLocalStorage()

  const cartItemsQuery = useAllCartItemsQuery({ enabled: Boolean(refreshToken) })
  const totalCartItems = cartItemsQuery.data?.data.totalItems || 0

  const logoutMutation = useLogoutMutation()
  const handleLogout = async () => {
    if (logoutMutation.isPending) return
    try {
      await logoutMutation.mutateAsync({ refreshToken })
      setProfile(null)
      clearLocalStorage()
      toast.success('Đăng xuất thành công')
    } catch (error) {
      setProfile(null)
      clearLocalStorage()
    }
  }

  return (
    <div className='flex items-center space-x-4'>
      {isAuth && (
        <Link
          to='cart'
          className='relative p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 rounded-lg'
        >
          <ShoppingCart className='h-6 w-6' />
          <span className='absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {totalCartItems}
          </span>
        </Link>
      )}
      <button className='p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 rounded-lg'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Settings className='h-6 w-6' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <div className='flex items-center justify-between'>
              <DropdownMenuLabel>{profile ? getFirstNameClient(profile.name) : 'Client'}</DropdownMenuLabel>
              <div className='mr-2'>
                <ModeToggle variant='outline' />
              </div>
            </div>
            <DropdownMenuSeparator />
            {isAuth ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to={'profile'} className='cursor-pointer'>
                    Tài khoản
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link to={'login'} className='cursor-pointer'>
                    Đăng nhập
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to={'register'} className='cursor-pointer'>
                    Đăng ký
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </button>
    </div>
  )
}
