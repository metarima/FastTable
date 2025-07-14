import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/auth.config';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
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
    
    const { id } = params;
    
    // Check if reservation belongs to this restaurant
    const reservation = await prisma.reservation.findUnique({ 
      where: { id },
      include: {
        tables: true
      }
    });
    
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    if (reservation.restaurantId !== restaurant.id) {
      return NextResponse.json({ error: 'Reservation does not belong to this restaurant' }, { status: 403 });
    }
    
    // Delete the reservation (cascade deletes ReservationTable entries)
    // First manually delete the reservation tables to ensure they're removed
    const deletedTables = await prisma.reservationTable.deleteMany({
      where: { reservationId: id }
    });
    console.log(`Deleted ${deletedTables.count} reservation table entries`);
    
    // Then delete the reservation
    const deletedReservation = await prisma.reservation.delete({ where: { id } });
    console.log(`Deleted reservation:`, deletedReservation.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 