import { Navigate, Outlet, useLocation, useRoutes } from 'react-router'
import ManageLayout from './layouts/manage'
import Product from './pages/manage/Product'
import Tag from './pages/manage/Tag'
import ManageLogin from './pages/manage/Login'
import AuthLayout from './layouts/auth'
import { useAppContext } from './components/AppProvider'
import { RoleName } from './constants/role'
import NotFound from './pages/common/NotFound'
import Category from './pages/manage/Category'
import Table from './pages/manage/Table'
import Coupon from './pages/manage/Coupon'
import Role from './pages/manage/Role'
import User from './pages/manage/User'
import Login from './pages/client/Login'

const Register = () => <div>Register Page - Sẽ được triển khai sau</div>
const ForgotPassword = () => <div>Forgot Password Page - Sẽ được triển khai sau</div>
const Dashboard = () => <div>Dashboard Page - Sẽ được triển khai sau</div>
const Bookings = () => <div>Bookings Page - Sẽ được triển khai sau</div>
const Orders = () => <div>Orders Page - Sẽ được triển khai sau</div>

function ProtectedRoute() {
  const { isAuth } = useAppContext()
  const location = useLocation()
  if (location.pathname.startsWith('/manage')) {
    return isAuth ? <Outlet /> : <Navigate to='/manage/login' />
  } else {
    return isAuth ? <Outlet /> : <Navigate to='/login' />
  }
}

function RejectedRoute() {
  const { isAuth, profile } = useAppContext()
  const MANAGE_ROLE = [RoleName.Admin, RoleName.Manager, RoleName.Employee] as string[]
  if (isAuth && profile) {
    const lastPath = sessionStorage.getItem('last-path')
    const fallbackPath = MANAGE_ROLE.includes(profile.role.name) ? '/manage/dashboard' : '/'
    return <Navigate to={lastPath || fallbackPath} />
  } else {
    return <Outlet />
  }
}

export default function useRouteElements() {
  const routeElements = useRoutes([
    {
      path: '',
      element: <AuthLayout />,
      children: [
        {
          path: 'forgot-password',
          element: <ForgotPassword />
        }
      ]
    },
    {
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: '',
          element: <AuthLayout />,
          children: [
            {
              path: 'login',
              element: <Login />
            },
            {
              path: 'register',
              element: <Register />
            },
            {
              path: 'manage/login',
              element: <ManageLogin />
            }
          ]
        }
      ]
    },
    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: 'manage',
          element: <ManageLayout />,
          children: [
            {
              path: 'dashboard',
              element: <Dashboard />
            },
            {
              path: 'products',
              element: <Product />
            },
            {
              path: 'categories',
              element: <Category />
            },
            {
              path: 'tags',
              element: <Tag />
            },
            {
              path: 'coupons',
              element: <Coupon />
            },
            {
              path: 'tables',
              element: <Table />
            },
            {
              path: 'bookings',
              element: <Bookings />
            },
            {
              path: 'orders',
              element: <Orders />
            },
            {
              path: 'users',
              element: <User />
            },
            {
              path: 'roles',
              element: <Role />
            }
          ]
        }
      ]
    },
    {
      path: '*',
      element: <NotFound />
    }
  ])

  return routeElements
}
