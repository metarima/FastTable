'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Restaurant = {
  id: string
  name: string
  description: string
  address: string
  cuisine: string
  email: string
  phone: string
  imageUrl?: string
  owner: {
    name: string
    email: string
  }
}

export default function RestaurantListing() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const cuisineTypes = ['Todas', 'Portuguesa', 'Italiana', 'Japonesa', 'Chinesa', 'Indiana', 'Mexicana', 'Mediterrânea', 'Brasileira', 'Fast Food', 'Vegetariana', 'Vegana', 'Outra']

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch('/api/restaurants')
        if (!res.ok) {
          throw new Error('Erro ao carregar restaurantes')
        }
        const data = await res.json()
        setRestaurants(data)
      } catch (error) {
        console.error('Error fetching restaurants:', error)
        setError('Erro ao carregar restaurantes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCuisine = !selectedCuisine || selectedCuisine === 'Todas' || restaurant.cuisine === selectedCuisine
    
    return matchesSearch && matchesCuisine
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar restaurantes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Secção de Pesquisa e Filtros */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pesquisar restaurantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grelha de Restaurantes */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map(restaurant => (
            <Link 
              key={restaurant.id}
              href={`/restaurants/${restaurant.id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={restaurant.imageUrl || '/images/restaurant-placeholder.jpg'}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
                <p className="text-gray-500 text-sm mb-4">{restaurant.address}</p>
                <p className="text-gray-600 line-clamp-2">{restaurant.description}</p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Contacto: {restaurant.phone || 'Não disponível'}</p>
                  <p>Email: {restaurant.email || 'Não disponível'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">Nenhum restaurante encontrado</h3>
            <p className="text-gray-500 mt-2">Tente ajustar a sua pesquisa ou filtros</p>
          </div>
        )}
      </div>
    </div>
  )
} 