import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../auth/auth.config'

const prisma = new PrismaClient()

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }
    const userId = session.user.id
    const { id } = params
    // Find the reservation and check ownership
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: { userId: true }
    })
    if (!reservation) {
      return NextResponse.json({ message: 'Reserva não encontrada' }, { status: 404 })
    }
    if (reservation.userId !== userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }
    // Delete the reservation (cascade deletes ReservationTable entries)
    await prisma.reservation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json({ message: 'Erro ao cancelar reserva' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 