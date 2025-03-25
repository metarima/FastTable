'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Dados de exemplo - serão substituídos por dados reais da base de dados mais tarde
const MOCK_RESTAURANTS = [
  {
    id: '1',
    name: 'O Italiano',
    cuisine: 'Italiana',
    rating: 4.5,
    priceRange: '$$',
    image: '/restaurant1.jpg',
    description: 'Autêntica cozinha italiana num ambiente acolhedor',
    address: 'Rua Principal 123, Cidade',
  },
  {
    id: '2',
    name: 'Sushi Master',
    cuisine: 'Japonesa',
    rating: 4.8,
    priceRange: '$$$',
    image: '/restaurant2.jpg',
    description: 'Sushi fresco e iguarias japonesas',
    address: 'Rua do Carvalho 456, Cidade',
  },
  // Adicionar mais restaurantes...
]

export default function RestaurantListing() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')

  const cuisineTypes = ['Todas', 'Italiana', 'Japonesa', 'Indiana', 'Mexicana', 'Chinesa', 'Portuguesa']

  const filteredRestaurants = MOCK_RESTAURANTS.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCuisine = !selectedCuisine || selectedCuisine === 'Todas' || restaurant.cuisine === selectedCuisine
    return matchesSearch && matchesCuisine
  })

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
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{restaurant.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine} • {restaurant.priceRange}</p>
                <p className="text-gray-500 text-sm mb-4">{restaurant.address}</p>
                <p className="text-gray-600 line-clamp-2">{restaurant.description}</p>
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