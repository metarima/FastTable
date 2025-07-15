'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Reservation = {
  id: string
  name: string
  email: string
  phone: string
  peopleCount: number
  time: string
  paid: boolean
  food: any
  createdAt: string
  restaurant: {
    id: string
    name: string
    address: string
    phone: string
    email: string
    imageUrl: string
    cuisine: string
  }
  tables: any[]
}

export default function ReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, upcoming, past
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/user/reservations')
        if (response.ok) {
          const data = await response.json()
          setReservations(data.reservations)
        } else {
          const error = await response.json()
          setError(error.message || 'Erro ao carregar reservas')
        }
      } catch (error) {
        console.error('Error fetching reservations:', error)
        setError('Falha ao carregar reservas')
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatus = (reservation: Reservation) => {
    const now = new Date()
    const reservationTime = new Date(reservation.time)
    
    if (reservationTime > now) {
      return { label: 'Próxima', color: 'bg-green-100 text-green-800' }
    } else {
      return { label: 'Concluída', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    // Filter by status
    const status = getStatus(reservation)
    if (filter === 'upcoming' && status.label !== 'Próxima') return false
    if (filter === 'past' && status.label !== 'Concluída') return false
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        reservation.restaurant.name.toLowerCase().includes(searchLower) ||
        reservation.restaurant.cuisine.toLowerCase().includes(searchLower) ||
        reservation.restaurant.address.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })

  const handleCancel = async (reservationId: string) => {
    if (!window.confirm('Tem a certeza que deseja cancelar esta reserva?')) return;
    try {
      const res = await fetch(`/api/user/reservations/${reservationId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReservations(prev => prev.filter(r => r.id !== reservationId));
      } else {
        const error = await res.json();
        alert(error.message || 'Erro ao cancelar reserva');
      }
    } catch (err) {
      alert('Erro ao cancelar reserva');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">As Minhas Reservas</h2>
        <p className="text-gray-600">Gerencie todas as suas reservas em restaurantes</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Procurar por restaurante, cozinha ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              filter === 'upcoming'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              filter === 'past'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Concluídas
          </button>
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filter !== 'all' ? 'Nenhuma reserva encontrada' : 'Nenhuma reserva ainda'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Tente ajustar os filtros ou termos de pesquisa'
              : 'Comece a explorar restaurantes e fazer reservas!'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <Link href="/restaurants" className="btn-primary">
              Explorar Restaurantes
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const status = getStatus(reservation)
            return (
              <div key={reservation.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Restaurant Image */}
                    {reservation.restaurant.imageUrl ? (
                      <Image
                        src={reservation.restaurant.imageUrl}
                        alt={reservation.restaurant.name}
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

                    {/* Reservation Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {reservation.restaurant.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-1">{reservation.restaurant.address}</p>
                          <p className="text-gray-500 text-sm">{reservation.restaurant.cuisine}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Data e Hora:</span> {formatDate(reservation.time)}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Pessoas:</span> {reservation.peopleCount}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Nome:</span> {reservation.name}
                          </p>
                        </div>
                        <div>
                          {reservation.email && (
                            <p className="text-gray-600">
                              <span className="font-medium">Email:</span> {reservation.email}
                            </p>
                          )}
                          {reservation.phone && (
                            <p className="text-gray-600">
                              <span className="font-medium">Telefone:</span> {reservation.phone}
                            </p>
                          )}
                          <p className="text-gray-600">
                            <span className="font-medium">Reservado em:</span> {formatDate(reservation.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Food Items */}
                      {reservation.food && Array.isArray(reservation.food) && reservation.food.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Itens do Menu:</p>
                          <div className="flex flex-wrap gap-2">
                            {reservation.food.map((item: any, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {item.name} {item.price && `(€${item.price.toFixed(2)})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/restaurants/${reservation.restaurant.id}`}
                      className="btn-primary text-sm"
                    >
                      Ver Restaurante
                    </Link>
                    {status.label === 'Próxima' && (
                      <button
                        className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        onClick={() => handleCancel(reservation.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {filteredReservations.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Mostrando {filteredReservations.length} de {reservations.length} reservas
          </p>
        </div>
      )}
    </div>
  )
} 