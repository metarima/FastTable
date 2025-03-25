'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type Step = 'basic' | 'menu' | 'hours'

const CUISINE_TYPES = [
  'Portuguesa',
  'Italiana',
  'Japonesa',
  'Chinesa',
  'Indiana',
  'Mexicana',
  'Mediterrânea',
  'Brasileira',
  'Fast Food',
  'Vegetariana',
  'Vegana',
  'Outra'
]

const DAYS_OF_WEEK = [
  { id: 'monday', name: 'Segunda-feira' },
  { id: 'tuesday', name: 'Terça-feira' },
  { id: 'wednesday', name: 'Quarta-feira' },
  { id: 'thursday', name: 'Quinta-feira' },
  { id: 'friday', name: 'Sexta-feira' },
  { id: 'saturday', name: 'Sábado' },
  { id: 'sunday', name: 'Domingo' }
]

export default function CreateRestaurant() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    cuisine: '',
    openingHours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' },
    }
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
    } else if ((session.user as any).userType !== 'restaurant') {
      router.push('/')
    }
  }, [session, status, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOpeningHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          [type]: value
        }
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!session?.user) {
      setError('Por favor, faça login para criar um restaurante')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          cuisine: formData.cuisine,
          openingHours: formData.openingHours
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar restaurante')
      }

      router.push('/create/success')
    } catch (error) {
      console.error('Restaurant creation error:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar restaurante')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="relative mb-8">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2"></div>
      <div className="relative flex justify-between">
        <div className={`flex flex-col items-center ${currentStep === 'basic' ? 'text-primary' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${
            currentStep === 'basic' ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
          }`}>
            1
          </div>
          <span className="text-sm font-medium">Informações Básicas</span>
        </div>
        <div className={`flex flex-col items-center ${currentStep === 'menu' ? 'text-primary' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${
            currentStep === 'menu' ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
          }`}>
            2
          </div>
          <span className="text-sm font-medium">Menu</span>
        </div>
        <div className={`flex flex-col items-center ${currentStep === 'hours' ? 'text-primary' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${
            currentStep === 'hours' ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
          }`}>
            3
          </div>
          <span className="text-sm font-medium">Horários</span>
        </div>
      </div>
    </div>
  )

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome do Restaurante
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            disabled={isLoading}
            placeholder="Ex: O Italiano"
          />
        </div>

        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700">
            Tipo de Cozinha
          </label>
          <select
            id="cuisine"
            name="cuisine"
            value={formData.cuisine}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            disabled={isLoading}
          >
            <option value="">Selecione um tipo de cozinha</option>
            {CUISINE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          disabled={isLoading}
          placeholder="Descreva o seu restaurante..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Endereço
          </label>
          <input
            id="address"
            name="address"
            type="text"
            required
            value={formData.address}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            disabled={isLoading}
            placeholder="Ex: Rua Principal 123, Lisboa"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            disabled={isLoading}
            placeholder="Ex: +351 123 456 789"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          disabled={isLoading}
          placeholder="Ex: contacto@restaurante.com"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCurrentStep('menu')}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          Próximo
        </button>
      </div>
    </div>
  )

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Menu do Restaurante</h3>
        <p className="text-gray-600">Esta funcionalidade estará disponível em breve.</p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep('basic')}
          className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep('hours')}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          Próximo
        </button>
      </div>
    </div>
  )

  const renderHours = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Horário de Funcionamento</h3>
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.id} className="flex items-center space-x-4">
              <div className="w-32 text-sm font-medium text-gray-700">{day.name}</div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="time"
                  value={formData.openingHours[day.id as keyof typeof formData.openingHours].open}
                  onChange={(e) => handleOpeningHoursChange(day.id, 'open', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                <span className="flex items-center text-gray-500">até</span>
                <input
                  type="time"
                  value={formData.openingHours[day.id as keyof typeof formData.openingHours].close}
                  onChange={(e) => handleOpeningHoursChange(day.id, 'close', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep('menu')}
          className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          Anterior
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors duration-200"
        >
          {isLoading ? 'A criar restaurante...' : 'Criar Restaurante'}
        </button>
      </div>
    </div>
  )

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Criar Novo Restaurante
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Preencha as informações abaixo para criar seu restaurante
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg p-8">
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit}>
            {currentStep === 'basic' && renderBasicInfo()}
            {currentStep === 'menu' && renderMenu()}
            {currentStep === 'hours' && renderHours()}
          </form>
        </div>
      </div>
    </div>
  )
} 