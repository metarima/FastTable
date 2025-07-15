'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    // Only allow customers to access profile
    const userType = session.user?.userType as string
    if (userType !== 'customer') {
      router.push('/')
      return
    }
    // Fetch user profile for header info
    const fetchProfile = async () => {
      setProfileLoading(true)
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.user)
        }
      } finally {
        setProfileLoading(false)
      }
    }
    fetchProfile()
  }, [session, status, router])

  if (status === 'loading' || profileLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar...</div>
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              FastTable
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/restaurants" className="text-gray-600 hover:text-primary">
                Restaurantes
              </Link>
              <Link href="/" className="text-gray-600 hover:text-primary">
                Início
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white font-bold text-xl">
                {profile.image ? (
                  <img src={profile.image} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-sm text-gray-500">Cliente desde {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-PT') : '-'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reservations'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  As Minhas Reservas
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Perfil
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === 'dashboard' && (
              <div className="p-6">
                <DashboardTab />
              </div>
            )}
            {activeTab === 'reservations' && (
              <div className="p-6">
                <ReservationsTab />
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="p-6">
                <ProfileTab onProfileUpdate={setProfile} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import DashboardTab from './components/DashboardTab'
import ReservationsTab from './components/ReservationsTab'
import ProfileTab from './components/ProfileTab' 