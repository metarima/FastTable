import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

// GET dashboard statistics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check authentication and authorization
    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    if (session.user?.userType !== 'admin') {
      return NextResponse.json(
        { message: 'Acesso não autorizado' },
        { status: 403 }
      )
    }
    
    // Get total users count
    const totalUsers = await prisma.user.count()
    
    // Get total customers count
    const totalCustomers = await prisma.user.count({
      where: { userType: 'customer' },
    })
    
    // Get total restaurants count
    const totalRestaurants = await prisma.restaurant.count({ where: { published: true } })
    
    // Get recent users (last 5)
    const recentUsers = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        createdAt: true,
      },
    })
    
    // Get recent restaurants (last 5)
    const recentRestaurants = await prisma.restaurant.findMany({
      where: { published: true },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
    
    return NextResponse.json({
      totalUsers,
      totalCustomers,
      totalRestaurants,
      recentUsers,
      recentRestaurants,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { message: 'Erro ao obter estatísticas do dashboard' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 