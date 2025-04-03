import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// GET all users
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
    
    // Get all users from database
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    
    return NextResponse.json({ users: usersWithoutPasswords })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Erro ao obter utilizadores' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST create new user
export async function POST(request: Request) {
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
    
    // Parse request body
    const body = await request.json()
    const { name, email, password, userType } = body
    
    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!password) {
      return NextResponse.json(
        { message: 'Password é obrigatória' },
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
    
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Utilizador com este email já existe' },
        { status: 400 }
      )
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType,
      },
    })
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser
    
    return NextResponse.json({
      message: 'Utilizador criado com sucesso',
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Erro ao criar utilizador' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 