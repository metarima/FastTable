import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// GET user profile
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
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password for security
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { message: 'Erro ao obter perfil do utilizador' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT update user profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const { name, email } = await req.json()
    
    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está em uso' },
        { status: 409 }
      )
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return NextResponse.json({ 
      user: updatedUser,
      message: 'Perfil atualizado com sucesso'
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 