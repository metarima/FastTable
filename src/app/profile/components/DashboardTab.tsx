'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type DashboardStats = {
  totalReservations: number
  recentReservations: any[]
  mostUsedRestaurant: any
  monthlyStats: Record<string, number>
  upcomingReservations: any[]
  favoriteCuisine: string | null
}

export default function DashboardTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/dashboard')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          const error = await response.json()
          setError(error.message || 'Erro ao carregar estatísticas')
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setError('Falha ao carregar estatísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!stats) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-PT', {
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
        <p className="text-gray-600">Aqui está um resumo da sua atividade de reservas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Reservas</p>
              <p className="text-3xl font-bold">{stats.totalReservations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Próximas Reservas</p>
              <p className="text-3xl font-bold">{stats.upcomingReservations.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Cozinha Favorita</p>
              <p className="text-xl font-bold">{stats.favoriteCuisine || 'N/A'}</p>
            </div>
            <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Most Used Restaurant */}
      {stats.mostUsedRestaurant && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurante Mais Visitado</h3>
          <div className="flex items-center gap-4">
            {stats.mostUsedRestaurant.imageUrl ? (
              <Image
                src={stats.mostUsedRestaurant.imageUrl}
                alt={stats.mostUsedRestaurant.name}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-900">{stats.mostUsedRestaurant.name}</h4>
              <p className="text-gray-600">{stats.mostUsedRestaurant.address}</p>
              <p className="text-sm text-gray-500">{stats.mostUsedRestaurant.cuisine}</p>
              <p className="text-sm text-primary font-medium">Visitado {stats.mostUsedRestaurant.visitCount} vezes</p>
            </div>
            <Link
              href={`/restaurants/${stats.mostUsedRestaurant.id}`}
              className="btn-primary"
            >
              Ver Restaurante
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Reservations */}
      {stats.upcomingReservations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Reservas</h3>
          <div className="space-y-4">
            {stats.upcomingReservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {reservation.restaurant.imageUrl ? (
                    <Image
                      src={reservation.restaurant.imageUrl}
                      alt={reservation.restaurant.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{reservation.restaurant.name}</h4>
                    <p className="text-sm text-gray-600">{formatDate(reservation.time)}</p>
                    <p className="text-sm text-gray-500">{reservation.peopleCount} pessoas</p>
                  </div>
                </div>
                <Link
                  href={`/restaurants/${reservation.restaurant.id}`}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Ver Detalhes
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Activity Chart */}
      {Object.keys(stats.monthlyStats).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Mensal</h3>
          <div className="space-y-3">
            {Object.entries(stats.monthlyStats)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-gray-700">{formatMonth(month)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min((count / Math.max(...Object.values(stats.monthlyStats))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Reservations */}
      {stats.recentReservations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas Recentes</h3>
          <div className="space-y-4">
            {stats.recentReservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {reservation.restaurant.imageUrl ? (
                    <Image
                      src={reservation.restaurant.imageUrl}
                      alt={reservation.restaurant.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{reservation.restaurant.name}</h4>
                    <p className="text-sm text-gray-600">{formatDate(reservation.time)}</p>
                    <p className="text-sm text-gray-500">{reservation.peopleCount} pessoas</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    new Date(reservation.time) > new Date() 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {new Date(reservation.time) > new Date() ? 'Próxima' : 'Concluída'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 