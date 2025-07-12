import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/auth.config';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all menu items for the current restaurant
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.userType !== 'restaurant' && session.user.userType !== 'restaurant_admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: userId } });
  if (!restaurant) {
    return NextResponse.json({ error: 'No restaurant found' }, { status: 404 });
  }
  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json({ menu: menuItems });
}

// POST: Add a new menu item (expects JSON body, imageUrl should be uploaded separately)
export async function POST(req: Request) {
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
  // Required: name, price. Optional: description, imageUrl, tags, category
  if (!data.name || typeof data.price !== 'number') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const menuItem = await prisma.menuItem.create({
    data: {
      name: data.name,
      description: data.description || '',
      price: data.price,
      imageUrl: data.imageUrl || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category || null,
      restaurantId: restaurant.id,
      order: data.order || 0,
    },
  });
  return NextResponse.json({ menuItem });
} 