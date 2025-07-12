import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/auth.config';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
  const tableTypes = await prisma.tableType.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { minSeats: 'asc' },
  });
  return NextResponse.json({ tableTypes });
}

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
  if (!Array.isArray(data.tableTypes)) {
    return NextResponse.json({ error: 'Invalid tableTypes data' }, { status: 400 });
  }
  // Delete all old table types for this restaurant
  await prisma.tableType.deleteMany({ where: { restaurantId: restaurant.id } });
  // Create new table types
  const created = await prisma.$transaction(async (tx) => {
    let count = 0;
    for (const t of data.tableTypes) {
      try {
        await tx.tableType.create({
          data: {
            name: t.name,
            minSeats: t.minSeats,
            maxSeats: t.maxSeats,
            quantity: t.quantity,
            restaurantId: restaurant.id,
          },
        });
        count++;
      } catch (err) {
        console.error('Error creating table type:', t, err);
        throw err;
      }
    }
    return { count };
  });
  return NextResponse.json({ count: created.count });
} 