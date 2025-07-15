import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/auth.config';
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
  const now = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const nextDay = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d;
  };
  // Views
  const views = await Promise.all(days.map(async (day) => {
    const count = await prisma.restaurantView.count({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: day,
          lt: nextDay(day),
        },
      },
    });
    return { date: day.toISOString().slice(0, 10), count };
  }));
  // Reservations
  const reservations = await Promise.all(days.map(async (day) => {
    const count = await prisma.reservation.count({
      where: {
        restaurantId: restaurant.id,
        time: {
          gte: day,
          lt: nextDay(day),
        },
      },
    });
    return { date: day.toISOString().slice(0, 10), count };
  }));
  return NextResponse.json({ views, reservations });
} 