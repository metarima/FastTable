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
      include: {
        tableTypes: true,
      },
    });
    if (!restaurant || !restaurant.published) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }
    // Map tableTypes to expected frontend format
    const tables = (restaurant.tableTypes || []).map(t => ({
      name: t.name,
      min: t.minSeats,
      max: t.maxSeats,
      qtd: t.quantity,
    }));
    return NextResponse.json({ restaurant: { ...restaurant, tables } });
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    return NextResponse.json({ error: 'Erro ao buscar restaurante' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 