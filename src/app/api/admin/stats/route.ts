import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    if (session.user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }
    
    // Get counts from database
    const [totalUsers, totalRestaurants] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count()
    ])
    
    return NextResponse.json({
      totalUsers,
      totalRestaurants,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 