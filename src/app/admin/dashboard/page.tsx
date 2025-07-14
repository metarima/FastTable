'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0
  })
  const [loading, setLoading] = useState(true)
  const [growth, setGrowth] = useState({ userGrowth: [], restaurantGrowth: [] });

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
    
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
          setGrowth({
            userGrowth: data.userGrowth || [],
            restaurantGrowth: data.restaurantGrowth || [],
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [session, status, router])

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar painel administrativo...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Utilizadores</h2>
          <p className="text-4xl font-bold">{stats.totalUsers}</p>
          <Link href="/admin/users" className="text-primary mt-4 inline-block hover:underline">
            Gerir Utilizadores →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Restaurantes</h2>
          <p className="text-4xl font-bold">{stats.totalRestaurants}</p>
          <Link href="/admin/restaurants" className="text-primary mt-4 inline-block hover:underline">
            Gerir Restaurantes →
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/users/create" 
            className="bg-primary text-white py-2 px-4 rounded-md text-center hover:bg-primary-dark transition-colors"
          >
            Adicionar Utilizador
          </Link>
          <Link 
            href="/admin/restaurants/create" 
            className="bg-primary text-white py-2 px-4 rounded-md text-center hover:bg-primary-dark transition-colors"
          >
            Adicionar Restaurante
          </Link>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Crescimento de Utilizadores (7 dias)</h2>
          <Line
            data={{
              labels: growth.userGrowth.map((d: any) => d.date),
              datasets: [
                {
                  label: 'Novos Utilizadores',
                  data: growth.userGrowth.map((d: any) => d.count),
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37,99,235,0.1)',
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
              },
            }}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Crescimento de Restaurantes (7 dias)</h2>
          <Line
            data={{
              labels: growth.restaurantGrowth.map((d: any) => d.date),
              datasets: [
                {
                  label: 'Novos Restaurantes',
                  data: growth.restaurantGrowth.map((d: any) => d.count),
                  borderColor: '#22c55e',
                  backgroundColor: 'rgba(34,197,94,0.1)',
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
} 