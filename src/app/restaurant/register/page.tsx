'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem')
      setIsLoading(false)
      return
    }

    try {
      // Register the restaurant
      const res = await fetch('/api/admin/register-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerName,
          email,
          password,
          restaurantName,
          restaurantDescription,
          restaurantAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registar restaurante')
      }

      setSuccess('Seu restaurante foi registado com sucesso! Você será redirecionado para o login em breve.')
      
      // Clear form
      setOwnerName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setRestaurantName('')
      setRestaurantDescription('')
      setRestaurantAddress('')
      
      // Sign in after registration
      setTimeout(async () => {
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        router.push('/create')
      }, 3000)
    } catch (error) {
      console.error('Restaurant registration error:', error)
      setError(error instanceof Error ? error.message : 'Erro ao registar restaurante')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registar seu Restaurante
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/80">
              iniciar sessão na sua conta existente
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Informações do Proprietário</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Palavra-passe
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar Palavra-passe
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Informações do Restaurante</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                    Nome do Restaurante
                  </label>
                  <input
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="restaurantAddress" className="block text-sm font-medium text-gray-700">
                    Endereço do Restaurante
                  </label>
                  <input
                    id="restaurantAddress"
                    name="restaurantAddress"
                    type="text"
                    required
                    value={restaurantAddress}
                    onChange={(e) => setRestaurantAddress(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="restaurantDescription" className="block text-sm font-medium text-gray-700">
                    Descrição do Restaurante
                  </label>
                  <textarea
                    id="restaurantDescription"
                    name="restaurantDescription"
                    rows={3}
                    value={restaurantDescription}
                    onChange={(e) => setRestaurantDescription(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'A processar...' : 'Registar Restaurante'}
            </button>
          </div>
        </form>

        <div className="pt-4 text-center">
          <p className="text-sm text-gray-600">
            Este formulário é exclusivo para proprietários de restaurantes.{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
              Crie uma conta normal aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 