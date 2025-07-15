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
  // 1. Number of reservations for today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const todayReservations = await prisma.reservation.findMany({
    where: {
      restaurantId: restaurant.id,
      time: { gte: startOfDay, lte: endOfDay },
    },
    select: { id: true, food: true },
  });
  const reservationsToday = todayReservations.length;

  // 2. Menu item count
  const menuItemCount = await prisma.menuItem.count({ where: { restaurantId: restaurant.id } });

  // 3. Most popular menu item (by count in food field of today's reservations)
  const menuItemCounts: Record<string, number> = {};
  for (const r of todayReservations) {
    if (Array.isArray(r.food)) {
      for (const item of r.food) {
        const foodItem = item as any;
        if (foodItem && foodItem.menuItemId) {
          menuItemCounts[foodItem.menuItemId] = (menuItemCounts[foodItem.menuItemId] || 0) + 1;
        }
      }
    }
  }
  let mostPopularMenuItem = null;
  if (Object.keys(menuItemCounts).length > 0) {
    const topMenuItemId = Object.entries(menuItemCounts).sort((a, b) => b[1] - a[1])[0][0];
    mostPopularMenuItem = await prisma.menuItem.findUnique({ where: { id: topMenuItemId } });
  }

  return NextResponse.json({
    reservationsToday,
    menuItemCount,
    mostPopularMenuItem,
  });
} 