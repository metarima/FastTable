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
  // Get all current table types for this restaurant
  const currentTableTypes = await prisma.tableType.findMany({ where: { restaurantId: restaurant.id } });
  // Get all tableTypeIds in use by reservations
  const usedTableTypeIds = new Set(
    (await prisma.reservationTable.findMany({
      where: { tableType: { restaurantId: restaurant.id } },
      select: { tableTypeId: true },
    })).map(rt => rt.tableTypeId)
  );
  // Prepare incoming tableTypes by id (if present)
  const incomingById = Object.fromEntries(data.tableTypes.filter(t => t.id).map(t => [t.id, t]));
  // For each table type in the new config:
  for (const t of data.tableTypes) {
    if (t.id) {
      // Find the current table type
      const current = currentTableTypes.find(ct => ct.id === t.id);
      if (current) {
        // If any property changed, create a new TableType and update all ReservationTable records
        if (
          current.name !== t.name ||
          current.minSeats !== t.minSeats ||
          current.maxSeats !== t.maxSeats ||
          current.quantity !== t.quantity
        ) {
          // Create new TableType
          const newTableType = await prisma.tableType.create({
            data: {
              name: t.name,
              minSeats: t.minSeats,
              maxSeats: t.maxSeats,
              quantity: t.quantity,
              restaurantId: restaurant.id,
            },
          });
          // Update all ReservationTable records to reference the new TableType
          await prisma.reservationTable.updateMany({
            where: { tableTypeId: t.id },
            data: { tableTypeId: newTableType.id },
          });
          // After update, check if old TableType is still referenced
          const stillReferenced = await prisma.reservationTable.findFirst({ where: { tableTypeId: t.id } });
          if (!stillReferenced) {
            await prisma.tableType.delete({ where: { id: t.id } });
          }
        } // else, unchanged, do nothing
      }
    } else {
      // New table type, create
      await prisma.tableType.create({
        data: {
          name: t.name,
          minSeats: t.minSeats,
          maxSeats: t.maxSeats,
          quantity: t.quantity,
          restaurantId: restaurant.id,
        },
      });
    }
  }
  // Delete table types not in the new config and not referenced
  for (const ct of currentTableTypes) {
    if (!data.tableTypes.some(t => t.id === ct.id)) {
      const stillReferenced = await prisma.reservationTable.findFirst({ where: { tableTypeId: ct.id } });
      if (!stillReferenced) {
        await prisma.tableType.delete({ where: { id: ct.id } });
      }
    }
  }
  // Optionally update reservationDuration if provided
  if (typeof data.reservationDuration === 'number' && data.reservationDuration > 0) {
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { reservationDuration: data.reservationDuration },
    });
  }
  return NextResponse.json({ success: true });
} 