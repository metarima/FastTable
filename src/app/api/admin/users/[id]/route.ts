import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../auth/auth.config'

const prisma = new PrismaClient()

// GET individual user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const userId = params.id
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { message: 'Erro ao obter utilizador' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update user by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const userId = params.id
    
    // Parse request body
    const body = await request.json()
    const { name, email, userType } = body
    
    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!userType) {
      return NextResponse.json(
        { message: 'Tipo de utilizador é obrigatório' },
        { status: 400 }
      )
    }
    
    // Check if valid user type
    const validUserTypes = ['admin', 'restaurant', 'restaurant_admin', 'customer']
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json(
        { message: 'Tipo de utilizador inválido' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }
    
    // Prevent removing the last admin
    if (existingUser.userType === 'admin' && userType !== 'admin') {
      const adminCount = await prisma.user.count({
        where: { userType: 'admin' },
      })
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: 'Não é possível alterar o tipo do último administrador' },
          { status: 400 }
        )
      }
    }
    
    // Check if email is taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })
      
      if (emailExists) {
        return NextResponse.json(
          { message: 'Email já está em uso por outro utilizador' },
          { status: 400 }
        )
      }
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        userType,
      },
    })
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser
    
    return NextResponse.json({
      message: 'Utilizador atualizado com sucesso',
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar utilizador' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE user by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const userId = params.id
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }
    
    // Prevent deleting the last admin
    if (user.userType === 'admin') {
      const adminCount = await prisma.user.count({
        where: { userType: 'admin' },
      })
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: 'Não é possível eliminar o último administrador' },
          { status: 400 }
        )
      }
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    })
    
    return NextResponse.json(
      { message: 'Utilizador eliminado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'Erro ao eliminar utilizador' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 