import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/auth.config'

const prisma = new PrismaClient()

export async function GET(req) {
  try {
    const url = new URL(req.url, 'http://localhost');
    const top = url.searchParams.get('top');
    if (top) {
      // Return top N restaurants by reservation count
      const topN = parseInt(top, 10) || 3;
      // Get published restaurants with reservation counts
      const restaurants = await prisma.restaurant.findMany({
        where: { published: true },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          cuisine: true,
          reservations: {
            select: { id: true },
          },
        },
      });
      // Sort by reservation count
      const sorted = restaurants
        .map(r => ({
          ...r,
          reservationCount: r.reservations.length,
        }))
        .sort((a, b) => b.reservationCount - a.reservationCount)
        .slice(0, topN);
      return NextResponse.json(sorted);
    }
    const restaurants = await prisma.restaurant.findMany({
      where: { published: true },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar restaurantes' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado' },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { 
      name, 
      description, 
      address, 
      phone, 
      email, 
      cuisine, 
      openingHours
    } = data

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: 'Nome e endereço são obrigatórios' },
        { status: 400 }
      )
    }

    // Create restaurant with exact field names from schema
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description: description || '',
        address,
        phone: phone || '',
        email: email || '',
        cuisine: cuisine || '',
        openingHours,
        ownerId: userId,
      },
    })

    return NextResponse.json(restaurant, { status: 201 })
  } catch (error) {
    console.error('Restaurant creation error:', error)
    // Return more specific error message if available
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar restaurante'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 