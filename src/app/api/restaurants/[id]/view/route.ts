import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req, { params }) {
  const { id: restaurantId } = params;
  console.log('API: Recording view for restaurant', restaurantId);
  if (!restaurantId) {
    console.error('API: Missing restaurant id');
    return NextResponse.json({ error: 'Missing restaurant id' }, { status: 400 });
  }
  try {
    await prisma.restaurantView.create({
      data: { restaurantId },
    });
    console.log('API: View recorded successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API: Error recording restaurant view:', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
} 