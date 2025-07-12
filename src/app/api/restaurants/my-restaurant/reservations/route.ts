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
  const reservations = await prisma.reservation.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { time: 'desc' },
    include: {
      user: true,
      tables: { include: { tableType: true } },
    },
  });
  return NextResponse.json({ reservations });
}

export async function POST(req: Request) {
  // Parse request
  const data = await req.json();
  const { name, email, phone, peopleCount, time, food } = data;
  if (!name || !peopleCount || !time) {
    return NextResponse.json({ error: 'Dados obrigatórios em falta.' }, { status: 400 });
  }
  // Find the restaurant (for now, assume only one restaurant per owner)
  // In a real app, you would pass restaurantId in the request
  const session = await getServerSession(authOptions);
  let restaurant;
  if (session && (session.user.userType === 'restaurant' || session.user.userType === 'restaurant_admin')) {
    restaurant = await prisma.restaurant.findUnique({ where: { ownerId: session.user.id } });
  } else if (data.restaurantId) {
    restaurant = await prisma.restaurant.findUnique({ where: { id: data.restaurantId } });
  }
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurante não encontrado.' }, { status: 404 });
  }
  // Get all table types, sorted by minSeats
  const tableTypes = await prisma.tableType.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { minSeats: 'asc' },
  });
  if (!tableTypes.length) {
    return NextResponse.json({ error: 'Nenhuma mesa configurada.' }, { status: 400 });
  }
  // Get reservations for the requested time (same hour)
  const reqTime = new Date(time);
  const reservationsAtTime = await prisma.reservation.findMany({
    where: {
      restaurantId: restaurant.id,
      time: {
        gte: new Date(reqTime.getFullYear(), reqTime.getMonth(), reqTime.getDate(), reqTime.getHours()),
        lt: new Date(reqTime.getFullYear(), reqTime.getMonth(), reqTime.getDate(), reqTime.getHours() + 1),
      },
    },
    include: { tables: true },
  });
  // Count used tables by type
  const used: { [id: string]: number } = {};
  for (const r of reservationsAtTime) {
    for (const t of r.tables) {
      used[t.tableTypeId] = (used[t.tableTypeId] || 0) + t.quantity;
    }
  }
  // Try to assign the smallest available table(s)
  let assignedTableType = null;
  let assignedQuantity = 1;
  for (const t of tableTypes) {
    if (t.minSeats <= peopleCount && peopleCount <= t.maxSeats) {
      const available = t.quantity - (used[t.id] || 0);
      if (available > 0) {
        assignedTableType = t;
        break;
      }
    }
  }
  // If no exact fit, try next larger table
  if (!assignedTableType) {
    for (const t of tableTypes) {
      if (t.minSeats >= peopleCount) {
        const available = t.quantity - (used[t.id] || 0);
        if (available > 0) {
          assignedTableType = t;
          break;
        }
      }
    }
  }
  if (!assignedTableType) {
    return NextResponse.json({ error: 'Nenhuma mesa disponível para o horário e número de pessoas selecionados.' }, { status: 409 });
  }
  // Create reservation
  const reservation = await prisma.reservation.create({
    data: {
      restaurantId: restaurant.id,
      name,
      email,
      phone,
      peopleCount,
      time: reqTime,
      paid: false,
      food: food || null,
      tables: {
        create: [{ tableTypeId: assignedTableType.id, quantity: assignedQuantity }],
      },
    },
    include: {
      tables: { include: { tableType: true } },
    },
  });
  return NextResponse.json({ reservation });
} 