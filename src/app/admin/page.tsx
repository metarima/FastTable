'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const userType = session.user?.userType as string

    if (userType === 'admin') {
      router.push('/admin/dashboard')
    } else if (userType === 'restaurant' || userType === 'restaurant_admin') {
      router.push('/admin/restaurant-dashboard')
    } else {
      // Not authorized
      router.push('/')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <div className="animate-pulse text-lg mb-4">A carregar painel administrativo...</div>
        <p className="text-sm text-gray-500">Você será redirecionado para a área administrativa adequada</p>
      </div>
    </div>
  )
} 