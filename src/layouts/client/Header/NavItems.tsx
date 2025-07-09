import { useLocation } from 'react-router'

export default function NavItems() {
  const location = useLocation()

  const navItems = [
    { name: 'Booking', href: '#' },
    { name: 'About us', href: '#' }
  ]

  return (
    <nav className='hidden md:flex items-center space-x-8'>
      {navItems.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={`font-medium transition-colors duration-200 relative group ${
            location.pathname === item.href ? 'text-gray-800' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {item.name}
          <span
            className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
              location.pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          ></span>
        </a>
      ))}
    </nav>
  )
}
