'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCallback } from 'react';
import Image from 'next/image';

type Restaurant = {
  id: string
  name: string
  description: string | null
  address: string
  phone: string | null
  email: string | null
  cuisine: string | null
  imageUrl: string | null
  published: boolean;
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

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [publishSuccess, setPublishSuccess] = useState(false);

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
          // Check if all required config fields are filled
          const r = data.restaurant
          const configIsComplete = !!(r && r.name && r.address && r.phone && r.email && r.cuisine && r.imageUrl)
          setConfigComplete(configIsComplete)
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
    // Fetch menu items for checklist
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/restaurants/my-restaurant/menu');
        if (res.ok) {
          const data = await res.json();
          setMenuComplete(Array.isArray(data.menu) && data.menu.length > 0);
        } else {
          setMenuComplete(false);
        }
      } catch {
        setMenuComplete(false);
      }
    };
    fetchMenu();
    // Fetch table types for checklist
    const fetchTables = async () => {
      try {
        const res = await fetch('/api/restaurants/my-restaurant/tables');
        if (res.ok) {
          const data = await res.json();
          setReservasComplete(Array.isArray(data.tableTypes) && data.tableTypes.length > 0);
        } else {
          setReservasComplete(false);
        }
      } catch {
        setReservasComplete(false);
      }
    };
    fetchTables();
    // Fetch stats
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/restaurants/my-restaurant/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setStatsError('Erro ao carregar estatísticas');
        }
      } catch {
        setStatsError('Erro ao carregar estatísticas');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
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

  const handlePublish = async () => {
    setError("");
    setPublishSuccess(false);
    try {
      const res = await fetch('/api/restaurants/my-restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: true }),
      });
      if (res.ok) {
        setShowPublish(false);
        setBannerVisible(false);
        setPublishSuccess(true);
        // Refetch restaurant data to update published state
        const response = await fetch('/api/restaurants/my-restaurant');
        if (response.ok) {
          const data = await response.json();
          setRestaurant(data.restaurant);
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao publicar restaurante');
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao publicar restaurante');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Painel do Restaurante</h1>
      {/* Info Banner */}
      {!restaurant.published && bannerVisible && (
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
      {/* --- STATS SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {statsLoading ? '...' : stats?.currentlyBookedPeople ?? '-'}
          </div>
          <div className="text-gray-700 text-lg font-medium">Pessoas reservadas hoje</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {statsLoading ? '...' : stats?.menuItemCount ?? '-'}
          </div>
          <div className="text-gray-700 text-lg font-medium">Itens no menu</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          {statsLoading ? (
            <div className="text-4xl font-bold text-primary mb-2">...</div>
          ) : stats?.mostPopularMenuItem ? (
            <>
              {stats.mostPopularMenuItem.imageUrl && (
                <div className="mb-2">
                  <Image src={stats.mostPopularMenuItem.imageUrl} alt={stats.mostPopularMenuItem.name} width={64} height={64} className="rounded-full object-cover" />
                </div>
              )}
              <div className="text-lg font-semibold text-primary mb-1">{stats.mostPopularMenuItem.name}</div>
              <div className="text-gray-700 text-sm">Mais popular hoje</div>
            </>
          ) : (
            <div className="text-gray-500">Nenhum item popular hoje</div>
          )}
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
            className="bg-gradient-to-r from-blue-500 to-blue-500 text-white py-2 px-4 rounded-md mt-2 block text-center font-semibold shadow hover:from-green-500 hover:to-blue-600 transition-colors"
          >
            Gerir Menu Personalizado
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
        {!restaurant.published && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
            onClick={() => setShowPublish((v) => !v)}
          >
            Publicar Restaurante
          </button>
        )}
        {showPublish && !restaurant.published && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">O seu restaurante está quase publicado!</h2>
            <p className="text-center mb-6 text-gray-700">O que falta:</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center justify-between">
                <span>Configurações</span>
                <span className="flex items-center gap-2">
                <span className={`font-bold ${configComplete ? 'text-green-600' : 'text-red-500'}`}>{configComplete ? '✔' : '✗'}</span>
                {!configComplete && (
                    <Link href="/admin/restaurant-dashboard/edit" className="text-primary underline text-sm">Ir para Configurações</Link>
                )}
                </span>
              </li>
              <li className="flex items-center justify-between opacity-80">
                <span>Menu</span>
                <span className="flex items-center gap-2">
                <span className={`font-bold ${menuComplete && configComplete ? 'text-green-600' : 'text-red-500'}`}>{menuComplete && configComplete ? '✔' : '✗'}</span>
                  {!menuComplete && (
                    <Link href="/admin/restaurant-dashboard/menu" className="text-primary underline text-sm">Ir para Menu</Link>
                  )}
                </span>
                {!configComplete && <span className="ml-4 text-gray-400 text-xs">Complete as configurações primeiro</span>}
              </li>
              <li className="flex items-center justify-between opacity-80">
                <span>Reservas</span>
                <span className="flex items-center gap-2">
                <span className={`font-bold ${reservasComplete && configComplete ? 'text-green-600' : 'text-red-500'}`}>{reservasComplete && configComplete ? '✔' : '✗'}</span>
                  {!reservasComplete && (
                    <Link href="/admin/restaurant-dashboard/reservations" className="text-primary underline text-sm">Ir para Reservas</Link>
                  )}
                </span>
                {!configComplete && <span className="ml-4 text-gray-400 text-xs">Complete as configurações primeiro</span>}
              </li>
            </ul>
            <button
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${allComplete ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!allComplete}
              onClick={handlePublish}
            >
              Publicar
            </button>
            {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
          </div>
        )}
        {publishSuccess && (
          <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md text-center font-semibold">
            O teu restaurante foi publicado!
          </div>
        )}
      </div>
    </div>
  )
} 