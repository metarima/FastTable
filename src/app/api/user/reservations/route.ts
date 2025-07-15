import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

// GET user reservations
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
    
    // Get user reservations with restaurant details
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            imageUrl: true,
            cuisine: true,
          }
        },
        tables: {
          include: {
            tableType: true
          }
        }
      },
      orderBy: {
        time: 'desc'
      }
    })
    
    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('Error fetching user reservations:', error)
    return NextResponse.json(
      { message: 'Erro ao obter reservas do utilizador' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 