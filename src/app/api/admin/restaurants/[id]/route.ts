import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../auth/auth.config'

const prisma = new PrismaClient()

// GET individual restaurant by ID
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
    
    const restaurantId = params.id
    
    // Get restaurant from database with owner information
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
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
    
    if (!restaurant) {
      return NextResponse.json(
        { message: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { message: 'Erro ao obter restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update restaurant by ID
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
    
    const restaurantId = params.id;
    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        owner: true,
      },
    });
    if (!existingRestaurant) {
      return NextResponse.json(
        { message: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }
    // Authorization: allow admin or owner
    if (
      session.user?.userType !== 'admin' &&
      session.user?.id !== existingRestaurant.ownerId
    ) {
      return NextResponse.json(
        { message: 'Acesso não autorizado' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    console.log('API received body:', body);
    const { name, description, address, ownerId } = body;
    
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
    
    // Check if owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    })
    
    if (!owner) {
      return NextResponse.json(
        { message: 'Proprietário não encontrado' },
        { status: 404 }
      )
    }
    
    // Update restaurant
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name,
        description,
        address,
        owner: { connect: { id: ownerId } },
        cuisine: body.cuisine,
        phone: body.phone,
        email: body.email,
        website: body.website,
        socialLinks: body.socialLinks,
        imageUrl: body.imageUrl,
        openingHours: body.openingHours,
        notes: body.notes,
        published: typeof body.published === 'boolean' ? body.published : existingRestaurant.published,
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
    
    // If the owner changed and isn't already a restaurant owner, update their user type
    if (ownerId !== existingRestaurant.ownerId && owner.userType !== 'restaurant') {
      await prisma.user.update({
        where: { id: ownerId },
        data: { userType: 'restaurant' },
      })
    }
    
    // Check if previous owner has other restaurants
    if (ownerId !== existingRestaurant.ownerId) {
      const formerOwnerRestaurantCount = await prisma.restaurant.count({
        where: { ownerId: existingRestaurant.ownerId },
      })
      
      // If former owner has no other restaurants, change their user type to customer
      if (formerOwnerRestaurantCount === 0 && existingRestaurant.owner.userType === 'restaurant') {
        await prisma.user.update({
          where: { id: existingRestaurant.ownerId },
          data: { userType: 'customer' },
        })
      }
    }
    
    return NextResponse.json({
      message: 'Restaurante atualizado com sucesso',
      restaurant: updatedRestaurant,
    })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE restaurant by ID
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
    
    const restaurantId = params.id
    
    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        owner: true,
      },
    })
    
    if (!restaurant) {
      return NextResponse.json(
        { message: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }
    
    // Delete restaurant
    await prisma.restaurant.delete({
      where: { id: restaurantId },
    })
    
    // Check if owner has other restaurants
    const ownerRestaurantCount = await prisma.restaurant.count({
      where: { ownerId: restaurant.ownerId },
    })
    
    // If owner has no other restaurants, change their user type to customer
    if (ownerRestaurantCount === 0 && restaurant.owner.userType === 'restaurant') {
      await prisma.user.update({
        where: { id: restaurant.ownerId },
        data: { userType: 'customer' },
      })
    }
    
    return NextResponse.json(
      { message: 'Restaurante eliminado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json(
      { message: 'Erro ao eliminar restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 