import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // Admin only: public restaurant sign-ups go through /api/restaurant-request and need approval
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, email, password, restaurantName, restaurantDescription, restaurantAddress } = await req.json()

    // Validate input
    if (!email || !password || !name || !restaurantName || !restaurantAddress) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios' },
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

    // Create user and restaurant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          userType: 'restaurant', // Set as restaurant owner
        },
      })

      // Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          description: restaurantDescription || null,
          address: restaurantAddress,
          ownerId: user.id,
        },
      })

      return { user, restaurant }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user

    return NextResponse.json(
      { message: 'Restaurante registado com sucesso! Aguarde aprovação', user: userWithoutPassword, restaurant: result.restaurant },
      { status: 201 }
    )
  } catch (error) {
    console.error('Restaurant registration error:', error)
    return NextResponse.json(
      { error: 'Erro ao registar restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 