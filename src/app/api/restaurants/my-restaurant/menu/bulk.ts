import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/auth.config';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
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
    if (!Array.isArray(data.menu)) {
      return NextResponse.json({ error: 'Invalid menu data' }, { status: 400 });
    }
    // Delete all old menu items for this restaurant
    await prisma.menuItem.deleteMany({ where: { restaurantId: restaurant.id } });
    // Create new menu items in a transaction
    const created = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const [idx, item] of data.menu.entries()) {
        try {
          await tx.menuItem.create({
            data: {
              name: item.name,
              description: item.description || '',
              price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
              imageUrl: item.image || item.imageUrl || '',
              tags: Array.isArray(item.tags) ? item.tags : [],
              category: item.category || null,
              restaurantId: restaurant.id,
              order: idx,
            },
          });
          count++;
        } catch (err) {
          console.error('Error creating menu item:', item, err);
          throw err;
        }
      }
      return { count };
    });
    return NextResponse.json({ count: created.count });
  } catch (error) {
    console.error('Bulk menu save error:', error);
    return NextResponse.json({ error: 'Erro ao salvar menu', details: error?.message || error }, { status: 500 });
  }
} 