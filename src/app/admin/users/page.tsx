'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type User = {
  id: string
  name: string | null
  email: string
  userType: string
  createdAt: string
}

export default function UsersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserType, setSelectedUserType] = useState<string>('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const userType = session.user?.userType as string
    
    if (userType !== 'admin') {
      router.push('/')
      return
    }
    
    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
          setFilteredUsers(data.users)
        } else {
          const error = await response.json()
          setError(error.message || 'Erro ao carregar utilizadores')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        setError('Falha ao carregar utilizadores')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [session, status, router])

  useEffect(() => {
    // Filter users based on search term and selected user type
    const filtered = users.filter(user => {
      // Filter by search term
      const matchesSearchTerm = 
        !searchTerm || 
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by user type
      const matchesUserType = selectedUserType === 'all' || user.userType === selectedUserType;
      
      return matchesSearchTerm && matchesUserType;
    });
    
    setFilteredUsers(filtered);
  }, [searchTerm, selectedUserType, users]);

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

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    
    setDeleteLoading(true)
    setDeleteError('')
    
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove user from state
        setUsers(users.filter(u => u.id !== userToDelete.id))
        setFilteredUsers(filteredUsers.filter(u => u.id !== userToDelete.id))
        setShowDeleteModal(false)
        setUserToDelete(null)
      } else {
        const error = await response.json()
        setDeleteError(error.message || 'Erro ao eliminar utilizador')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setDeleteError('Falha ao eliminar utilizador')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar utilizadores...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestão de Utilizadores</h1>
        <Link 
          href="/admin/users/create" 
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Adicionar Utilizador
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
          <div className="w-full md:w-2/3">
            <label htmlFor="search" className="sr-only">Pesquisar</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Pesquisar por nome ou email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <label htmlFor="userType" className="sr-only">Filtrar por tipo</label>
            <select
              id="userType"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              <option value="admin">Administradores</option>
              <option value="restaurant">Proprietários de Restaurante</option>
              <option value="restaurant_admin">Admin de Restaurante</option>
              <option value="customer">Clientes</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum utilizador encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os seus filtros ou adicione um novo utilizador.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Utilizador
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.userType === 'admin' ? 'bg-purple-100 text-purple-800' : ''} 
                        ${user.userType === 'restaurant' ? 'bg-green-100 text-green-800' : ''} 
                        ${user.userType === 'restaurant_admin' ? 'bg-blue-100 text-blue-800' : ''} 
                        ${user.userType === 'customer' ? 'bg-gray-100 text-gray-800' : ''}`}>
                        {getUserTypeLabel(user.userType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/users/${user.id}`} className="text-primary hover:text-primary-dark">
                          <span className="sr-only">Editar</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-900"
                          disabled={user.userType === 'admin' && users.filter(u => u.userType === 'admin').length <= 1}
                        >
                          <span className="sr-only">Eliminar</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Eliminar Utilizador
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Tem certeza que deseja eliminar o utilizador {userToDelete.name || userToDelete.email}? Esta ação não pode ser desfeita.
                      </p>
                      {deleteError && (
                        <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    deleteLoading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'
                  } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {deleteLoading ? 'A eliminar...' : 'Eliminar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                    setDeleteError('')
                  }}
                  disabled={deleteLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 