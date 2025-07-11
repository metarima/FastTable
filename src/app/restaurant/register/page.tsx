'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RestaurantSignUp() {
  const router = useRouter()
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [restaurantDescription, setRestaurantDescription] = useState('')
  const [restaurantAddress, setRestaurantAddress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validatePassword = (pwd: string) => {
    // Minimum 8 chars, at least 1 letter or number, and 1 special char
    return /^(?=.*[A-Za-z0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pwd)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset error and success messages
    setError('')
    setSuccess('')
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('As passwords não coincidem')
      return
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
      setError('A password deve ter pelo menos 8 caracteres, incluindo pelo menos uma letra ou número e um caractere especial.')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/restaurant-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName,
          ownerEmail: email,
          password,
          restaurantName,
          restaurantDescription,
          restaurantAddress,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Solicitação enviada com sucesso! Após a aprovação de um administrador, você será notificado por email.')
        // Clear form
        setOwnerName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setRestaurantName('')
        setRestaurantDescription('')
        setRestaurantAddress('')
      } else {
        setError(data.message || 'Ocorreu um erro ao enviar a solicitação')
      }
    } catch (error) {
      console.error('Error submitting restaurant request:', error)
      setError('Ocorreu um erro ao enviar a solicitação. Por favor, tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrar Restaurante
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Preencha o formulário para solicitar o registro do seu restaurante
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informações do Proprietário</h3>
            
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Seu nome completo"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="seu.email@exemplo.com"
              />
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-10"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center justify-center absolute inset-y-0 right-0 h-full px-3 focus:outline-none"
                aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
              >
                {showPassword ? (
                  // Heroicons EyeSlash
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 15.885 7.24 19.5 12 19.5c1.563 0 3.05-.322 4.39-.9m3.63-2.6A10.45 10.45 0 0022.066 12c-1.292-3.885-5.306-7.5-10.066-7.5-1.13 0-2.22.186-3.24.53m-2.78 3.193l13.5 13.5m-13.5-13.5l13.5 13.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  // Heroicons Eye
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5s8.5 3 9.75 7.5c-1.25 4.5-5.25 7.5-9.75 7.5s-8.5-3-9.75-7.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
            
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-10"
                placeholder="Confirme sua password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="flex items-center justify-center absolute inset-y-0 right-0 h-full px-3 focus:outline-none"
                aria-label={showConfirmPassword ? 'Ocultar password' : 'Mostrar password'}
              >
                {showConfirmPassword ? (
                  // Heroicons EyeSlash
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 15.885 7.24 19.5 12 19.5c1.563 0 3.05-.322 4.39-.9m3.63-2.6A10.45 10.45 0 0022.066 12c-1.292-3.885-5.306-7.5-10.066-7.5-1.13 0-2.22.186-3.24.53m-2.78 3.193l13.5 13.5m-13.5-13.5l13.5 13.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  // Heroicons Eye
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5s8.5 3 9.75 7.5c-1.25 4.5-5.25 7.5-9.75 7.5s-8.5-3-9.75-7.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Informações do Restaurante</h3>
            </div>
            
            <div>
              <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                Nome do Restaurante <span className="text-red-500">*</span>
              </label>
              <input
                id="restaurantName"
                name="restaurantName"
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Nome do seu restaurante"
              />
            </div>
            
            <div>
              <label htmlFor="restaurantDescription" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="restaurantDescription"
                name="restaurantDescription"
                rows={3}
                value={restaurantDescription}
                onChange={(e) => setRestaurantDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Breve descrição do seu restaurante"
              />
            </div>
            
            <div>
              <label htmlFor="restaurantAddress" className="block text-sm font-medium text-gray-700">
                Endereço <span className="text-red-500">*</span>
              </label>
              <input
                id="restaurantAddress"
                name="restaurantAddress"
                type="text"
                required
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Endereço completo do restaurante"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600">Já tem uma conta?</span>{' '}
              <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/80">
                Entrar
              </Link>
            </div>
            
            <div className="text-sm">
              <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
                Criar conta normal
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-primary/70' : 'bg-primary hover:bg-primary/90'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            <p>
              Após o envio, sua solicitação será revisada por um administrador.
              Você receberá uma notificação por email quando sua solicitação for processada.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 