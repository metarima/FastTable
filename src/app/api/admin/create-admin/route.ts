import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // Only allowed for the very first admin (initial setup) or for a logged-in admin
    const adminCount = await prisma.user.count({ where: { userType: 'admin' } })
    if (adminCount > 0) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.userType !== 'admin') {
        return NextResponse.json(
          { error: 'Já existe um administrador. Apenas administradores podem criar novos administradores.' },
          { status: 403 }
        )
      }
    }

    const { name, email, password } = await req.json()

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está registado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType: 'admin',
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'Administrador criado com sucesso', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar administrador' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 