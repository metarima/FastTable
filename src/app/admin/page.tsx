'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Stats = {
  totalUsers: number
  totalRestaurants: number
  totalCustomers: number
  recentUsers: {
    id: string
    name: string | null
    email: string
    userType: string
    createdAt: string
  }[]
  recentRestaurants: {
    id: string
    name: string
    address: string
    ownerId: string
    createdAt: string
    owner: {
      name: string | null
      email: string
    }
  }[]
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const userType = session.user?.userType as string
    
    if (userType !== 'admin') {
      router.push('/')
      return
    }
    
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          const error = await response.json()
          setError(error.message || 'Erro ao carregar estatísticas')
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Falha ao carregar estatísticas')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [session, status, router])

  const getUserTypeLabel = (userType: string) => {
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
        return userType
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar estatísticas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      {stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary bg-opacity-10">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm">Total de Utilizadores</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/admin/users" 
                  className="text-primary hover:text-primary-dark text-sm font-medium inline-flex items-center"
                >
                  Ver todos
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm">Total de Restaurantes</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.totalRestaurants}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/admin/restaurants" 
                  className="text-primary hover:text-primary-dark text-sm font-medium inline-flex items-center"
                >
                  Ver todos
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
                  <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm">Total de Clientes</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.totalCustomers}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/admin/users" 
                  className="text-primary hover:text-primary-dark text-sm font-medium inline-flex items-center"
                >
                  Ver todos
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Utilizadores Recentes</h2>
                <Link 
                  href="/admin/users" 
                  className="text-primary hover:text-primary-dark text-sm"
                >
                  Ver todos
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {stats.recentUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Nenhum utilizador recente encontrado
                  </div>
                ) : (
                  stats.recentUsers.map(user => (
                    <div key={user.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Sem nome'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="text-sm text-right">
                          <div className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 
                            ${user.userType === 'admin' ? 'bg-purple-100 text-purple-800' : ''} 
                            ${user.userType === 'restaurant' ? 'bg-green-100 text-green-800' : ''} 
                            ${user.userType === 'restaurant_admin' ? 'bg-blue-100 text-blue-800' : ''} 
                            ${user.userType === 'customer' ? 'bg-gray-100 text-gray-800' : ''}`}>
                            {getUserTypeLabel(user.userType)}
                          </div>
                          <div className="text-gray-500 mt-1">{new Date(user.createdAt).toLocaleDateString('pt-PT')}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Recent Restaurants */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Restaurantes Recentes</h2>
                <Link 
                  href="/admin/restaurants" 
                  className="text-primary hover:text-primary-dark text-sm"
                >
                  Ver todos
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {stats.recentRestaurants.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Nenhum restaurante recente encontrado
                  </div>
                ) : (
                  stats.recentRestaurants.map(restaurant => (
                    <div key={restaurant.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">{restaurant.address}</div>
                        </div>
                        <div className="text-sm text-right">
                          <div className="text-gray-700">
                            {restaurant.owner.name || restaurant.owner.email}
                          </div>
                          <div className="text-gray-500 mt-1">{new Date(restaurant.createdAt).toLocaleDateString('pt-PT')}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 