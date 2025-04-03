'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function AdminSetup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      // Create admin user directly
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar administrador')
      }

      setSuccess('Administrador criado com sucesso! Você será redirecionado para o login em alguns segundos.')
      
      // Clear form
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)
    } catch (error) {
      console.error('Admin creation error:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar administrador')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configuração da Conta Principal de Administrador
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Esta página é apenas para a criação do administrador principal do sistema.
            Use-a apenas uma vez para configurar o acesso administrativo inicial.
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

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Nome completo"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Endereço de Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Endereço de email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Palavra-passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Palavra-passe"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar Palavra-passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Confirmar palavra-passe"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'A criar administrador...' : 'Criar Conta de Administrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 