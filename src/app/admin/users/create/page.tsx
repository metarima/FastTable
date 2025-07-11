'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateUser() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const currentUserType = session.user?.userType as string
    
    if (currentUserType !== 'admin') {
      router.push('/')
      return
    }
  }, [session, status, router])
  
  const validatePassword = (pwd: string) => {
    // Minimum 8 chars, at least 1 number, 1 special char, 1 uppercase
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pwd)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate data
    if (password !== confirmPassword) {
      setError('As passwords não coincidem')
      return
    }
    
    if (!validatePassword(password)) {
      setError('A password deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.')
      return
    }
    
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          userType,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        router.push('/admin/users')
      } else {
        setError(data.message || 'Falha ao criar utilizador')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setError('Falha ao criar utilizador')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <div className="flex items-center mb-8">
        <Link 
          href="/admin/users" 
          className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Adicionar Utilizador</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome (opcional)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Nome do utilizador"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Email do utilizador"
                required
              />
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-10"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 px-3 focus:outline-none"
                aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
              >
                {showPassword ? (
                  // Eye-off SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0021.9 12c0 2.21-.715 4.25-1.936 5.936M9.88 9.88a3 3 0 104.24 4.24" /></svg>
                ) : (
                  // Eye SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.364 0a9.956 9.956 0 01-1.636 5.364M4.636 6.636A9.956 9.956 0 002.1 12c0 2.21.715 4.25 1.936 5.936M9.88 9.88a3 3 0 104.24 4.24" /></svg>
                )}
              </button>
            </div>
            
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-10"
                placeholder="Confirme a password"
                minLength={8}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 px-3 focus:outline-none"
                aria-label={showConfirmPassword ? 'Ocultar password' : 'Mostrar password'}
              >
                {showConfirmPassword ? (
                  // Eye-off SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0021.9 12c0 2.21-.715 4.25-1.936 5.936M9.88 9.88a3 3 0 104.24 4.24" /></svg>
                ) : (
                  // Eye SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.364 0a9.956 9.956 0 01-1.636 5.364M4.636 6.636A9.956 9.956 0 002.1 12c0 2.21.715 4.25 1.936 5.936M9.88 9.88a3 3 0 104.24 4.24" /></svg>
                )}
              </button>
            </div>
            
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Utilizador <span className="text-red-500">*</span>
              </label>
              <select
                id="userType"
                name="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                <option value="customer">Cliente</option>
                <option value="restaurant">Proprietário de Restaurante</option>
                <option value="restaurant_admin">Admin de Restaurante</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Atenção: Criar um utilizador como Administrador dará acesso total ao sistema.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link
              href="/admin/users"
              className="mr-4 bg-white border border-gray-300 py-2 px-4 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'A criar...' : 'Criar Utilizador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 