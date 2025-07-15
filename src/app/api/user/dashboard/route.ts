import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

// GET user dashboard stats
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Get total reservations count
    const totalReservations = await prisma.reservation.count({
      where: { userId }
    })
    
    // Get recent reservations (last 5)
    const recentReservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            cuisine: true,
          }
        }
      },
      orderBy: {
        time: 'desc'
      },
      take: 5
    })
    
    // Get most used restaurant
    const restaurantUsage = await prisma.reservation.groupBy({
      by: ['restaurantId'],
      where: { userId },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 1
    })
    
    let mostUsedRestaurant = null
    if (restaurantUsage.length > 0) {
      const topRestaurantId = restaurantUsage[0].restaurantId
      mostUsedRestaurant = await prisma.restaurant.findUnique({
        where: { id: topRestaurantId },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          cuisine: true,
          address: true,
        }
      })
      
      if (mostUsedRestaurant) {
        mostUsedRestaurant.visitCount = restaurantUsage[0]._count.id
      }
    }
    
    // Get reservations by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyReservations = await prisma.reservation.findMany({
      where: {
        userId,
        time: {
          gte: sixMonthsAgo
        }
      },
      select: {
        time: true
      }
    })
    
    // Group by month
    const monthlyStats = monthlyReservations.reduce((acc, reservation) => {
      const month = new Date(reservation.time).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Get upcoming reservations
    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        userId,
        time: {
          gte: new Date()
        }
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            cuisine: true,
          }
        }
      },
      orderBy: {
        time: 'asc'
      },
      take: 3
    })
    
    // Get favorite cuisine (based on most visited restaurant type)
    const cuisineStats = await prisma.reservation.groupBy({
      by: ['restaurantId'],
      where: { userId },
      _count: {
        id: true
      }
    })
    
    let favoriteCuisine = null
    if (cuisineStats.length > 0) {
      const restaurantIds = cuisineStats.map(stat => stat.restaurantId)
      const restaurants = await prisma.restaurant.findMany({
        where: {
          id: { in: restaurantIds }
        },
        select: {
          cuisine: true
        }
      })
      
      const cuisineCounts = restaurants.reduce((acc, restaurant) => {
        acc[restaurant.cuisine] = (acc[restaurant.cuisine] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const topCuisine = Object.entries(cuisineCounts).sort(([,a], [,b]) => b - a)[0]
      if (topCuisine) {
        favoriteCuisine = topCuisine[0]
      }
    }
    
    return NextResponse.json({
      totalReservations,
      recentReservations,
      mostUsedRestaurant,
      monthlyStats,
      upcomingReservations,
      favoriteCuisine
    })
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error)
    return NextResponse.json(
      { message: 'Erro ao obter estatísticas do dashboard' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 