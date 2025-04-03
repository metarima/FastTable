'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Restaurant = {
  id: string
  name: string
  address: string
  cuisine: string | null
  email: string | null
  phone: string | null
  createdAt: string
  owner: {
    id: string
    name: string | null
    email: string
  }
}

export default function RestaurantsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
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
    
    // Fetch restaurants
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/admin/restaurants')
        if (response.ok) {
          const data = await response.json()
          setRestaurants(data.restaurants)
        } else {
          const error = await response.json()
          setError(error.message)
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error)
        setError('Falha ao carregar restaurantes')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRestaurants()
  }, [session, status, router])

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar restaurantes...</div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestão de Restaurantes</h1>
        <Link 
          href="/admin/restaurants/create" 
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
        >
          Adicionar Restaurante
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endereço
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de Cozinha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proprietário
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Criação
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{restaurant.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{restaurant.cuisine || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{restaurant.owner.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{restaurant.owner.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(restaurant.createdAt).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/restaurants/${restaurant.id}`} className="text-primary hover:text-primary-dark mr-4">
                    Editar
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 