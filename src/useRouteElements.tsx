import { Navigate, Outlet, useLocation, useRoutes } from 'react-router'
import ManageLayout from './layouts/manage'
import ManageProduct from './pages/manage/Product'
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
import OAuth from './pages/client/OAuth'
import Register from './pages/client/Register'
import ForgotPassword from './pages/client/ForgotPassword'
import ClientLayout from './layouts/client'
import Product from './pages/client/Product'
import ProductDetail from './pages/client/ProductDetail'
import Cart from './pages/client/Cart'
import Checkout from './pages/client/Checkout'
import PaymentCallback from './pages/client/PaymentCallback'
import ProfileLayout from './pages/client/Profile'
import Information from './pages/client/Profile/pages/Information'
import ChangePassword from './pages/client/Profile/pages/ChangePassword'
import OrderHistory from './pages/client/Profile/pages/OrderHistory'
import Order from './pages/manage/Order'

const Dashboard = () => <div>Dashboard Page - Sẽ được triển khai sau</div>
const Bookings = () => <div>Bookings Page - Sẽ được triển khai sau</div>

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
      element: <ClientLayout />,
      children: [
        {
          path: 'oauth-google-callback',
          element: <OAuth />
        },
        {
          path: '',
          index: true,
          element: <Product />
        },
        {
          path: ':productName',
          element: <ProductDetail />
        },
        {
          path: 'cart',
          element: <Cart />
        }
      ]
    },
    {
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: '',
          element: <ClientLayout />,
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
              path: 'forgot-password',
              element: <ForgotPassword />
            }
          ]
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
          path: '',
          element: <ClientLayout />,
          children: [
            {
              path: 'checkout',
              element: <Checkout />
            },
            {
              path: 'profile',
              element: <ProfileLayout />,
              children: [
                {
                  path: '',
                  element: <Information />
                },
                {
                  path: 'change-password',
                  element: <ChangePassword />
                },
                {
                  path: 'orders-history/online',
                  element: <OrderHistory orderType='Delivery' />
                },
                {
                  path: 'orders-history/dine-in',
                  element: <OrderHistory orderType='DineIn' />
                }
              ]
            }
          ]
        },
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
              element: <ManageProduct />
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
              element: <Order />
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
      path: 'payment-callback',
      element: <PaymentCallback />
    },
    {
      path: '*',
      element: <NotFound />
    }
  ])

  return routeElements
}
