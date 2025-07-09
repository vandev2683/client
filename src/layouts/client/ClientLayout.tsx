import { Outlet } from 'react-router'
import Header from './Header'
import Footer from './Footer'

export default function ClientLayout() {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
