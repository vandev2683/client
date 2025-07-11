import { Outlet } from 'react-router'
import UserSideNav from './UserSideNav'

export default function UserLayout() {
  return (
    <div className='bg-neutral-100 py-4 text-sm text-gray-600'>
      <div className='max-w-6xl px-4 mx-auto'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
          <div className='md:col-span-4 lg:col-span-3'>
            <UserSideNav />
          </div>
          <div className='md:col-span-8 lg:col-span-9'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
