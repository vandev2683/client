import {
  Home,
  Salad,
  ShoppingCart,
  Table,
  Users2,
  Tag,
  ChartBarStacked,
  ShieldQuestionMark,
  TicketPercent
} from 'lucide-react'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Link, useLocation } from 'react-router'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import tableApis from '@/apis/table'

const manageItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    PrefetchData() {}
  },
  {
    title: 'Đơn hàng',
    Icon: ShoppingCart,
    href: '/manage/orders'
  },
  {
    title: 'Bàn ăn',
    Icon: Table,
    href: '/manage/tables'
  },
  {
    title: 'Sản phẩm',
    Icon: Salad,
    href: '/manage/products'
  },
  {
    title: 'Danh mục',
    Icon: ChartBarStacked,
    href: '/manage/categories'
  },
  {
    title: 'Thẻ',
    Icon: Tag,
    href: '/manage/tags'
  },
  {
    title: 'Mã giảm giá',
    Icon: TicketPercent,
    href: '/manage/coupons'
  },
  {
    title: 'Tài khoản',
    Icon: Users2,
    href: '/manage/users'
  },
  {
    title: 'Vai trò & Quyền hạn',
    Icon: ShieldQuestionMark,
    href: '/manage/roles'
  }
]

export function NavMain() {
  const pathname = useLocation().pathname
  return (
    <SidebarGroup>
      <SidebarMenu>
        {manageItems.map((item) => {
          const isActive = pathname.startsWith(item.href)

          return (
            <SidebarMenuItem key={item.title} className='mb-1'>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.href} className={cn(isActive && 'font-bold bg-sidebar-primary/20')}>
                  <item.Icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
