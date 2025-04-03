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
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Erro ao obter utilizadores' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 