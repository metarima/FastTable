import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/auth.config'
import { sendMail } from '@/lib/emailer';
import { emailTemplate } from '@/lib/emailTemplate';

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário está autenticado e é um admin
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }
    
    if (session.user?.userType !== 'admin') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
    }
    
    const { id } = params
    
    // Obter o motivo da rejeição do corpo da solicitação
    const { rejectionReason } = await request.json()
    
    if (!rejectionReason || rejectionReason.trim() === '') {
      return NextResponse.json(
        { message: 'Motivo da rejeição é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar a solicitação
    const restaurantRequest = await prisma.restaurantRequest.findUnique({
      where: {
        id
      }
    })
    
    if (!restaurantRequest) {
      return NextResponse.json({ message: 'Solicitação não encontrada' }, { status: 404 })
    }
    
    if (restaurantRequest.status !== 'pending') {
      return NextResponse.json(
        { message: 'Esta solicitação já foi processada' },
        { status: 400 }
      )
    }
    
    // Atualizar o status da solicitação para rejeitado
    const updatedRequest = await prisma.restaurantRequest.update({
      where: {
        id
      },
      data: {
        status: 'rejected',
        rejectionReason
      }
    })

    // Send rejection email to requester
    if (restaurantRequest?.ownerEmail) {
      await sendMail({
        to: restaurantRequest.ownerEmail,
        subject: 'Seu restaurante foi rejeitado - FastTable',
        html: emailTemplate({
          title: 'Restaurante rejeitado',
          message: `Olá ${restaurantRequest.ownerName || restaurantRequest.name},<br/>Seu pedido de restaurante <b>${restaurantRequest.name}</b> foi rejeitado.<br/><b>Motivo:</b> ${rejectionReason}`
        })
      });
    }
    
    return NextResponse.json({
      message: 'Solicitação rejeitada com sucesso',
      request: updatedRequest
    })
    
  } catch (error) {
    console.error('Error rejecting restaurant request:', error)
    return NextResponse.json(
      { message: 'Erro ao rejeitar solicitação de restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 