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

  // Checklist state (replace with real checks later)
  const [showPublish, setShowPublish] = useState(false)
  // These would be replaced with real logic
  const [configComplete, setConfigComplete] = useState(false)
  const [menuComplete, setMenuComplete] = useState(false)
  const [reservasComplete, setReservasComplete] = useState(false)
  const allComplete = configComplete && menuComplete && reservasComplete

  // Add published state (replace with real value from restaurant later)
  const [bannerVisible, setBannerVisible] = useState(true)
  // Replace with real published status from restaurant
  const published = false

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
      {/* Info Banner */}
      {!published && bannerVisible && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md flex items-center justify-between">
          <span>
            <strong>O teu restaurante não está publicado.</strong> Completa todos os passos e publica para ficar visível ao público.
          </span>
          <button
            onClick={() => setBannerVisible(false)}
            className="ml-4 text-yellow-700 hover:text-yellow-900 font-bold text-lg focus:outline-none"
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      )}
      
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
          <h2 className="text-xl font-semibold mb-2">Configurações</h2>
          <p className="text-gray-600 mb-4">Defina as informações essenciais do seu restaurante</p>
          <Link 
            href="/admin/restaurant-dashboard/edit" 
            className="text-primary hover:underline"
          >
            Editar Configurações →
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
          <h2 className="text-xl font-semibold mb-2">Reservas</h2>
          <p className="text-gray-600 mb-4">Gerencie as reservas do seu restaurante</p>
          <Link 
            href="/admin/restaurant-dashboard/reservations" 
            className="text-primary hover:underline"
          >
            Ver Reservas →
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
          onClick={() => setShowPublish((v) => !v)}
        >
          Publicar Restaurante
        </button>
        {showPublish && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">O seu restaurante está quase publicado!</h2>
            <p className="text-center mb-6 text-gray-700">O que falta:</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center justify-between">
                <span>Configurações</span>
                <span className={`font-bold ${configComplete ? 'text-green-600' : 'text-red-500'}`}>{configComplete ? '✔' : '✗'}</span>
                {!configComplete && (
                  <a
                    href="/admin/restaurant-dashboard/edit"
                    className="ml-4 text-primary underline text-sm"
                  >
                    Preencher Configurações
                  </a>
                )}
              </li>
              <li className="flex items-center justify-between opacity-80">
                <span>Menu</span>
                <span className={`font-bold ${menuComplete && configComplete ? 'text-green-600' : 'text-red-500'}`}>{menuComplete && configComplete ? '✔' : '✗'}</span>
                {!configComplete && <span className="ml-4 text-gray-400 text-xs">Complete as configurações primeiro</span>}
              </li>
              <li className="flex items-center justify-between opacity-80">
                <span>Reservas</span>
                <span className={`font-bold ${reservasComplete && configComplete ? 'text-green-600' : 'text-red-500'}`}>{reservasComplete && configComplete ? '✔' : '✗'}</span>
                {!configComplete && <span className="ml-4 text-gray-400 text-xs">Complete as configurações primeiro</span>}
              </li>
            </ul>
            <button
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${allComplete ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!allComplete}
            >
              Publicar
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 