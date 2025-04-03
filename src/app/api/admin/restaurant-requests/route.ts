import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Verificar se o usuário está autenticado e é um admin
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }
    
    if (session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }
    
    // Buscar todas as solicitações de restaurantes
    const requests = await prisma.restaurantRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching restaurant requests:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar solicitações de restaurantes' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 