'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type User = {
  id: string
  name: string | null
  email: string
  userType: string
  createdAt: string
}

export default function EditUser() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
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
    
    // Fetch user
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`)
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setName(data.user.name || '')
          setEmail(data.user.email)
          setUserType(data.user.userType)
        } else {
          const error = await response.json()
          setError(error.message || 'Erro ao carregar utilizador')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setError('Falha ao carregar utilizador')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [session, status, router, userId])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError('')
    setSuccess('')
    setUpdating(true)
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          userType,
        }),
      })
      
      if (response.ok) {
        setSuccess('Utilizador atualizado com sucesso')
        
        // Update local user state
        if (user) {
          setUser({
            ...user,
            name,
            email,
            userType,
          })
        }
      } else {
        const error = await response.json()
        setError(error.message || 'Erro ao atualizar utilizador')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Falha ao atualizar utilizador')
    } finally {
      setUpdating(false)
    }
  }
  
  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'Administrador'
      case 'restaurant':
        return 'Proprietário de Restaurante'
      case 'restaurant_admin':
        return 'Admin de Restaurante'
      case 'customer':
        return 'Cliente'
      default:
        return userType
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar utilizador...</div>
      </div>
    )
  }
  
  if (error && !user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/admin/users" className="text-primary hover:text-primary-dark">
          Voltar para a lista de utilizadores
        </Link>
      </div>
    )
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
        <h1 className="text-2xl font-bold">Editar Utilizador</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {user && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-md p-4">
              <h2 className="text-lg font-semibold mb-2">Informações Atuais</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">ID:</div>
                <div className="font-medium text-sm truncate">{user.id}</div>
                
                <div className="text-gray-600">Nome:</div>
                <div className="font-medium">{user.name || 'N/A'}</div>
                
                <div className="text-gray-600">Email:</div>
                <div className="font-medium">{user.email}</div>
                
                <div className="text-gray-600">Tipo:</div>
                <div className="font-medium">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.userType === 'admin' ? 'bg-purple-100 text-purple-800' : ''} 
                    ${user.userType === 'restaurant' ? 'bg-green-100 text-green-800' : ''} 
                    ${user.userType === 'restaurant_admin' ? 'bg-blue-100 text-blue-800' : ''} 
                    ${user.userType === 'customer' ? 'bg-gray-100 text-gray-800' : ''}`}>
                    {getUserTypeLabel(user.userType)}
                  </span>
                </div>
                
                <div className="text-gray-600">Criado em:</div>
                <div className="font-medium">{new Date(user.createdAt).toLocaleDateString('pt-PT')}</div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Editar Informações</h2>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
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
                  Email
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
              
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Utilizador
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="restaurant">Proprietário de Restaurante</option>
                  <option value="restaurant_admin">Admin de Restaurante</option>
                  <option value="customer">Cliente</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link
              href="/admin/users"
              className="mr-4 bg-white border border-gray-300 py-2 px-4 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={updating}
              className={`bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors ${
                updating ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {updating ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 