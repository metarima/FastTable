import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/auth.config';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PUT: Update a menu item
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.userType !== 'restaurant' && session.user.userType !== 'restaurant_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: userId } });
  if (!restaurant) {
    return NextResponse.json({ error: 'No restaurant found' }, { status: 404 });
  }
  const data = await req.json();
  const menuItem = await prisma.menuItem.update({
    where: {
      id: params.id,
      restaurantId: restaurant.id,
    },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category,
      order: data.order,
    },
  });
  return NextResponse.json({ menuItem });
}

// DELETE: Remove a menu item
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.userType !== 'restaurant' && session.user.userType !== 'restaurant_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: userId } });
  if (!restaurant) {
    return NextResponse.json({ error: 'No restaurant found' }, { status: 404 });
  }
  await prisma.menuItem.delete({
    where: {
      id: params.id,
      restaurantId: restaurant.id,
    },
  });
  return NextResponse.json({ success: true });
} 