'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'basic' | 'menu' | 'booking'

export default function CreateRestaurant() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('basic')
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
    },
  })

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

  const handleNext = () => {
    if (currentStep === 'basic') {
      setCurrentStep('menu')
    } else if (currentStep === 'menu') {
      setCurrentStep('booking')
    }
  }

  const handleBack = () => {
    if (currentStep === 'menu') {
      setCurrentStep('basic')
    } else if (currentStep === 'booking') {
      setCurrentStep('menu')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData)
    // For now, we'll just redirect to a success page
    router.push('/create/success')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className={`w-1/3 h-1 ${currentStep === 'basic' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-1/3 h-1 ${currentStep === 'menu' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-1/3 h-1 ${currentStep === 'booking' ? 'bg-primary' : 'bg-gray-200'}`}></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-sm ${currentStep === 'basic' ? 'text-primary font-semibold' : 'text-gray-500'}`}>
              Basic Info
            </span>
            <span className={`text-sm ${currentStep === 'menu' ? 'text-primary font-semibold' : 'text-gray-500'}`}>
              Menu
            </span>
            <span className={`text-sm ${currentStep === 'booking' ? 'text-primary font-semibold' : 'text-gray-500'}`}>
              Booking
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8">Cria o teu restaurante!</h1>

          <form onSubmit={handleSubmit}>
            {currentStep === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Restaurante
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Cozinha
                  </label>
                  <select
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Selecione um tipo de cozinha</option>
                    <option value="italian">Italiana</option>
                    <option value="japanese">Japonesa</option>
                    <option value="indian">Indiana</option>
                    <option value="mexican">Mexicana</option>
                    <option value="chinese">Chinesa</option>
                    <option value="american">Americana</option>
                    <option value="other">Outra</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    Seguinte
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'menu' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Configuração do Menu</h2>
                  <p className="text-gray-600">Vamos criar o menu no próximo passo. Por agora, vamos para as configurações de reserva.</p>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary"
                  >
                    Seguinte
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'booking' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Configurações de Reserva</h2>
                  <p className="text-gray-600">Configure as horas de funcionamento e as preferências de reserva do seu restaurante.</p>
                </div>

                <div className="space-y-4">
                  {Object.entries(formData.openingHours).map(([day, hours]) => (
                    <div key={day} className="grid grid-cols-3 gap-4 items-center">
                      <span className="capitalize">{day}</span>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Criar Restaurante
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
} 