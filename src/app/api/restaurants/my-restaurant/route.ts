import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is restaurant owner
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const userType = session.user.userType
    
    if (userType !== 'restaurant' && userType !== 'restaurant_admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }
    
    // Get restaurant data
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: userId }
    })
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      restaurant
    })
  } catch (error) {
    console.error('Error fetching restaurant data:', error)
    return NextResponse.json(
      { error: 'Erro ao obter dados do restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    const userId = session.user.id
    const userType = session.user.userType
    if (userType !== 'restaurant' && userType !== 'restaurant_admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }
    const body = await req.json()
    // Support both menuThemeColor and published update
    const data: any = {}
    if (body.menuThemeColor) data.menuThemeColor = body.menuThemeColor
    if (typeof body.published === 'boolean') data.published = body.published
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      )
    }
    const restaurant = await prisma.restaurant.update({
      where: { ownerId: userId },
      data,
    })
    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 