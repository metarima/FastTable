'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Restaurant = {
  id: string
  name: string
  description: string | null
  address: string
  phone: string | null
  email: string | null
  cuisine: string | null
  imageUrl: string | null
}

export default function RestaurantDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const userType = session.user?.userType as string
    
    if (userType !== 'restaurant' && userType !== 'restaurant_admin') {
      router.push('/')
      return
    }
    
    // Fetch restaurant data
    const fetchRestaurant = async () => {
      try {
        const response = await fetch('/api/restaurants/my-restaurant')
        if (response.ok) {
          const data = await response.json()
          setRestaurant(data.restaurant)
        } else {
          const error = await response.json()
          if (response.status === 404) {
            // No restaurant found, redirect to create page
            router.push('/create')
          }
          setError(error.message)
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error)
        setError('Falha ao carregar dados do restaurante')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRestaurant()
  }, [session, status, router])

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar dados do restaurante...</div>
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

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="text-lg mb-4">Você ainda não tem um restaurante registado.</div>
        <Link 
          href="/create" 
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
        >
          Registar Restaurante
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Painel do Restaurante</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{restaurant.name}</h2>
            <p className="text-gray-600">{restaurant.address}</p>
          </div>
          <Link 
            href="/admin/restaurant-dashboard/edit" 
            className="bg-primary text-white py-2 px-4 rounded-md mt-4 md:mt-0 text-center hover:bg-primary-dark transition-colors"
          >
            Editar Informações
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Reservas</h2>
          <p className="text-gray-600 mb-4">Gerencie as reservas do seu restaurante</p>
          <Link 
            href="/admin/restaurant-dashboard/reservations" 
            className="text-primary hover:underline"
          >
            Ver Reservas →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Menu</h2>
          <p className="text-gray-600 mb-4">Gerencie o menu do seu restaurante</p>
          <Link 
            href="/admin/restaurant-dashboard/menu" 
            className="text-primary hover:underline"
          >
            Gerir Menu →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Horários</h2>
          <p className="text-gray-600 mb-4">Defina horários de funcionamento</p>
          <Link 
            href="/admin/restaurant-dashboard/hours" 
            className="text-primary hover:underline"
          >
            Definir Horários →
          </Link>
        </div>
      </div>
    </div>
  )
} 