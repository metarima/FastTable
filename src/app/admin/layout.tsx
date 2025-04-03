'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
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
    { name: 'Usuários', href: '/admin/users', icon: Icons.Users, adminOnly: true },
    { name: 'Restaurantes', href: '/admin/restaurants', icon: Icons.Restaurants, adminOnly: true },
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
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-40 w-full bg-white shadow-md p-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {Icons.Hamburger}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-64 bg-white shadow-lg`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b">
            <h1 className="text-xl font-semibold text-gray-800">
              {isAdmin ? 'Admin' : 'Área do Restaurante'}
            </h1>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="mt-6 px-3 flex-1">
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session?.user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout 