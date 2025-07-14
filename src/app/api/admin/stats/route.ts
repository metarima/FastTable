import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    if (session.user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }
    
    // Get counts from database
    const [totalUsers, totalRestaurants] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count()
    ])

    // Get daily new users and restaurants for the last 7 days
    const now = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    // Helper to get next day
    const nextDay = (date) => {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      return d;
    };

    // Query for users
    const userGrowth = await Promise.all(days.map(async (day) => {
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: day,
            lt: nextDay(day)
          }
        }
      });
      return { date: day.toISOString().slice(0, 10), count };
    }));

    // Query for restaurants
    const restaurantGrowth = await Promise.all(days.map(async (day) => {
      const count = await prisma.restaurant.count({
        where: {
          createdAt: {
            gte: day,
            lt: nextDay(day)
          }
        }
      });
      return { date: day.toISOString().slice(0, 10), count };
    }));

    return NextResponse.json({
      totalUsers,
      totalRestaurants,
      userGrowth,
      restaurantGrowth,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 