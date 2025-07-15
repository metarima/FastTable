'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type RestaurantRequest = {
  id: string
  name: string
  description: string | null
  address: string
  ownerName: string | null
  ownerEmail: string
  status: string
  createdAt: string
  rejectionReason: string | null
}

export default function RestaurantRequestsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<RestaurantRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<RestaurantRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  
  // Approval/Rejection modals
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RestaurantRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  // Add state for details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false)

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
    
    // Fetch restaurant requests
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/admin/restaurant-requests')
        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests)
          setFilteredRequests(data.requests.filter((req: RestaurantRequest) => req.status === 'pending'))
        } else {
          const error = await response.json()
          setError(error.message || 'Erro ao carregar solicitações')
        }
      } catch (error) {
        console.error('Error fetching restaurant requests:', error)
        setError('Falha ao carregar solicitações')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRequests()
  }, [session, status, router])

  useEffect(() => {
    // Filter requests based on search term and status filter
    const filtered = requests.filter(request => {
      // Filter by status
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      // Filter by search term
      const matchesSearchTerm = 
        !searchTerm || 
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        request.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.ownerName && request.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        request.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearchTerm;
    });
    
    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  const handleApproveClick = (request: RestaurantRequest) => {
    setSelectedRequest(request)
    setShowApproveModal(true)
    setActionError('')
  }

  const handleRejectClick = (request: RestaurantRequest) => {
    setSelectedRequest(request)
    setShowRejectModal(true)
    setRejectionReason('')
    setActionError('')
  }

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return
    
    setActionLoading(true)
    setActionError('')
    
    try {
      const response = await fetch(`/api/admin/restaurant-requests/${selectedRequest.id}/approve`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Update request in state
        const updatedRequests = requests.map(req => 
          req.id === selectedRequest.id ? { ...req, status: 'approved' } : req
        )
        setRequests(updatedRequests)
        setShowApproveModal(false)
        setSelectedRequest(null)
      } else {
        const error = await response.json()
        setActionError(error.message || 'Erro ao aprovar solicitação')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      setActionError('Falha ao aprovar solicitação')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return
    
    if (!rejectionReason.trim()) {
      setActionError('Por favor, forneça um motivo para a rejeição')
      return
    }
    
    setActionLoading(true)
    setActionError('')
    
    try {
      const response = await fetch(`/api/admin/restaurant-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason,
        }),
      })
      
      if (response.ok) {
        // Update request in state
        const updatedRequests = requests.map(req => 
          req.id === selectedRequest.id ? { ...req, status: 'rejected', rejectionReason } : req
        )
        setRequests(updatedRequests)
        setShowRejectModal(false)
        setSelectedRequest(null)
        setRejectionReason('')
      } else {
        const error = await response.json()
        setActionError(error.message || 'Erro ao rejeitar solicitação')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      setActionError('Falha ao rejeitar solicitação')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pendente
          </span>
        )
      case 'approved':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Aprovado
          </span>
        )
      case 'rejected':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Rejeitado
          </span>
        )
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar solicitações...</div>
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
      <h1 className="text-2xl font-bold mb-8">Solicitações de Restaurantes</h1>
      
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
                placeholder="Pesquisar por nome, endereço ou proprietário"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <label htmlFor="statusFilter" className="sr-only">Filtrar por status</label>
            <select
              id="statusFilter"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'pending' ? 'Não há solicitações pendentes no momento.' : 'Tente ajustar os filtros para encontrar solicitações.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proprietário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {/* New column for details */}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{request.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.ownerName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">{request.ownerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          Motivo: {request.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleApproveClick(request)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <span className="sr-only">Aprovar</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRejectClick(request)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <span className="sr-only">Rejeitar</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-gray-400">Processado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }}
                        className="text-blue-600 hover:text-blue-900 underline"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Aprovar Solicitação
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Tem certeza que deseja aprovar a solicitação do restaurante <strong>{selectedRequest.name}</strong>? Isso criará um novo restaurante e uma conta de usuário para o proprietário.
                      </p>
                      {actionError && (
                        <p className="mt-2 text-sm text-red-600">{actionError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleApproveConfirm}
                  disabled={actionLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    actionLoading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'
                  } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {actionLoading ? 'Processando...' : 'Aprovar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowApproveModal(false)
                    setSelectedRequest(null)
                    setActionError('')
                  }}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Rejeitar Solicitação
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Tem certeza que deseja rejeitar a solicitação do restaurante <strong>{selectedRequest.name}</strong>?
                      </p>
                      
                      <div>
                        <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                          Motivo da Rejeição <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="rejectionReason"
                          name="rejectionReason"
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Explique o motivo da rejeição"
                          required
                        />
                      </div>
                      
                      {actionError && (
                        <p className="mt-2 text-sm text-red-600">{actionError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  disabled={actionLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    actionLoading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'
                  } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {actionLoading ? 'Processando...' : 'Rejeitar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedRequest(null)
                    setRejectionReason('')
                    setActionError('')
                  }}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Detalhes da Solicitação
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div><strong>Restaurante:</strong> {selectedRequest.name}</div>
                      <div><strong>Descrição:</strong> {selectedRequest.description || 'N/A'}</div>
                      <div><strong>Endereço:</strong> {selectedRequest.address}</div>
                      <div><strong>Proprietário:</strong> {selectedRequest.ownerName || 'N/A'}</div>
                      <div><strong>Email do Proprietário:</strong> {selectedRequest.ownerEmail}</div>
                      <div><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</div>
                      <div><strong>Data de Criação:</strong> {new Date(selectedRequest.createdAt).toLocaleString('pt-PT')}</div>
                      {selectedRequest.rejectionReason && (
                        <div><strong>Motivo da Rejeição:</strong> {selectedRequest.rejectionReason}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => { setShowDetailsModal(false); setSelectedRequest(null); }}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 