import { PaymentStatus } from '@/constants/payment'
import { ArrowRight, CircleCheck, CircleX } from 'lucide-react'
import { Link, useLocation } from 'react-router'

export default function PaymentCallback() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const paymentStatus = searchParams.get('status')

  return paymentStatus === PaymentStatus.Succeeded ? (
    <div className='flex flex-col items-center justify-center min-h-[100dvh] px-4 md:px-6 py-12 md:py-24 lg:py-32'>
      <div className='max-w-md text-center space-y-4'>
        <div className='bg-primary/10 dark:bg-primary rounded-full p-4 inline-flex'>
          <CircleCheck className='h-8 w-8 text-primary dark:text-primary/40' />
        </div>
        <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Payment Successful</h1>
        <p className='text-gray-500 dark:text-gray-400 md:text-xl mb-8'>Thank you for your purchase.</p>
        <Link
          to='/'
          className='px-4 py-3 rounded-md font-semibold border-1 border-primary/90 text-gray-800 hover:text-white hover:bg-primary'
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center min-h-[100dvh] px-4 md:px-6 py-12 md:py-24 lg:py-32'>
      <div className='max-w-md text-center space-y-4'>
        <div className='bg-red-100 dark:bg-red-900 rounded-full p-4 inline-flex'>
          <CircleX className='h-8 w-8 text-red-500 dark:text-red-400' />
        </div>
        <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Payment Failure</h1>
        <p className='text-gray-500 dark:text-gray-400 md:text-xl mb-8'>
          Something went wrong with your payment. Please try again later.{' '}
          <Link to='/'>
            <span className='text-black underline'>Go to Home</span>
            <ArrowRight className='inline h-4 w-4 text-black ml-1' />
          </Link>
        </p>
      </div>
    </div>
  )
}
