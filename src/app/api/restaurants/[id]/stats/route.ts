import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id: restaurantId } = params;
  
  if (!restaurantId) {
    return NextResponse.json({ error: 'Missing restaurant id' }, { status: 400 });
  }

  try {
    // Get restaurant to verify it exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, published: true }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    if (!restaurant.published) {
      return NextResponse.json({ error: 'Restaurant not published' }, { status: 404 });
    }

    // Get today's reservations to find most popular menu items
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

    // Count menu item popularity
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

    // Get the most popular menu items
    const mostPopularMenuItems = [];
    if (Object.keys(menuItemCounts).length > 0) {
      const sortedItems = Object.entries(menuItemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      for (const [menuItemId, count] of sortedItems) {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: menuItemId },
          select: { id: true, name: true, price: true, imageUrl: true }
        });
        if (menuItem) {
          mostPopularMenuItems.push({ ...menuItem, orderCount: count });
        }
      }
    }

    return NextResponse.json({
      mostPopularMenuItems,
      reservationsToday: todayReservations.length,
    });

  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 