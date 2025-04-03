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
    
    // Get all restaurants with owner info
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Erro ao obter restaurantes' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 