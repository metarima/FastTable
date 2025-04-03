import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

// GET all restaurants
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
    
    // Get all restaurants from database with owner information
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
      { message: 'Erro ao obter restaurantes' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST create new restaurant
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
    const { name, description, address, ownerId } = body
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: 'Nome do restaurante é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!address) {
      return NextResponse.json(
        { message: 'Endereço é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!ownerId) {
      return NextResponse.json(
        { message: 'Proprietário é obrigatório' },
        { status: 400 }
      )
    }
    
    // Check if owner exists and is a restaurant owner
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    })
    
    if (!owner) {
      return NextResponse.json(
        { message: 'Proprietário não encontrado' },
        { status: 404 }
      )
    }
    
    // Create new restaurant
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name,
        description,
        address,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    
    // If the owner isn't already a restaurant owner, update their user type
    if (owner.userType !== 'restaurant') {
      await prisma.user.update({
        where: { id: ownerId },
        data: { userType: 'restaurant' },
      })
    }
    
    return NextResponse.json({
      message: 'Restaurante criado com sucesso',
      restaurant: newRestaurant,
    })
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { message: 'Erro ao criar restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 