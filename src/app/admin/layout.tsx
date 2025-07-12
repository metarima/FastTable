'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

// Function to get user type label
const getUserTypeLabel = (userType: string): string => {
  switch (userType) {
    case 'admin':
      return 'Administrador'
    case 'restaurant':
      return 'Proprietário de Restaurante'
    case 'restaurant_admin':
      return 'Admin de Restaurante'
    case 'customer':
      return 'Cliente'
    default:
      return userType || 'Usuário'
  }
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userType = session.user.userType as string
      setIsAdmin(userType === 'admin')
      setIsRestaurantOwner(userType === 'restaurant' || userType === 'restaurant_admin')
    }
  }, [session, status])

  // SVG Icons
  const Icons = {
    Dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    Users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    Restaurants: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    Menu: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    Reservations: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    Settings: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    Hamburger: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )
  }

  // Navigation items for different user types
  const adminNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Icons.Dashboard },
    { name: 'Utilizadores', href: '/admin/users', icon: Icons.Users, adminOnly: true },
    { name: 'Restaurantes', href: '/admin/restaurants', icon: Icons.Restaurants, adminOnly: true },
    { name: 'Solicitações', href: '/admin/restaurant-requests', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ), adminOnly: true },
    { name: 'Configurações', href: '/admin/settings', icon: Icons.Settings }
  ]

  const restaurantNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin/restaurant-dashboard', icon: Icons.Dashboard },
    { name: 'Menu', href: '/admin/restaurant-dashboard/menu', icon: Icons.Menu },
    { name: 'Reservas', href: '/admin/restaurant-dashboard/reservations', icon: Icons.Reservations },
    { name: 'Configurações', href: '/admin/restaurant-dashboard/edit', icon: Icons.Settings }
  ]

  // Choose navigation based on user type
  const navigation = isAdmin ? adminNavigation : restaurantNavigation

  // Filter out admin-only items for non-admin users
  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">Carregando...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-lg mb-4">Você precisa estar autenticado para acessar esta página</div>
          <Link href="/auth/signin" className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
            Entrar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-white lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        }`}
        style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} // Enable horizontal scroll
      >
        <div className="flex items-center justify-between flex-shrink-0 p-4 border-b">
          <Link href="/" className="text-xl font-semibold text-primary">
            FastTable Admin
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 transition-colors duration-200 rounded-md text-gray-500 hover:text-red-500 hover:bg-gray-100 lg:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col justify-between h-full">
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {filteredNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100 ${
                  pathname === item.href ? 'bg-primary bg-opacity-10 text-primary font-medium' : ''
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {getUserTypeLabel(session?.user?.userType as string)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Link 
                href="/?from=admin"
                prefetch={false}
                className="flex items-center p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 w-full text-left"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                  />
                </svg>
                <span className="ml-3">Ir para o Site</span>
              </Link>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                <span className="ml-3">Terminar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-gray-500 rounded-md hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <Link href="/" className="text-xl font-semibold text-primary">
            FastTable Admin
          </Link>
          <div className="flex items-center space-x-2">
            <Link 
              href="/?from=admin"
              prefetch={false}
              className="p-1 text-gray-500 rounded-md hover:text-gray-900"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
            </Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-1 text-gray-500 rounded-md hover:text-gray-900"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 