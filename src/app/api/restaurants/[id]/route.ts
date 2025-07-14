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
    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    return NextResponse.json({ error: 'Erro ao buscar restaurante' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 