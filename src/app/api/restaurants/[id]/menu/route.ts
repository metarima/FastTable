import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });
    if (!restaurant || !restaurant.published) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ menu: menuItems });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Erro ao buscar menu' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 