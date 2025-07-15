import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/auth.config'
import bcrypt from 'bcrypt'
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
    
    // Iniciar uma transação para garantir que tudo seja criado corretamente
    const result = await prisma.$transaction(async (tx) => {
      // Verificar se já existe um usuário com este email
      let user = await tx.user.findUnique({
        where: {
          email: restaurantRequest.ownerEmail
        }
      })
      
      // Se não existe, criar um novo usuário do tipo 'restaurant'
      if (!user) {
        user = await tx.user.create({
          data: {
            name: restaurantRequest.ownerName || restaurantRequest.name,
            email: restaurantRequest.ownerEmail,
            password: restaurantRequest.password, // A senha já está hash do formulário de solicitação
            userType: 'restaurant',
            emailVerified: new Date(),
          }
        })
      } else if (user.userType !== 'restaurant') {
        // Se o usuário existe mas não é um restaurante, atualizar o tipo
        user = await tx.user.update({
          where: {
            id: user.id
          },
          data: {
            userType: 'restaurant'
          }
        })
      }
      
      // Criar o restaurante
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantRequest.name,
          description: restaurantRequest.description,
          address: restaurantRequest.address,
          ownerId: user.id,
          published: false
        }
      })
      
      // Atualizar o status da solicitação
      const updatedRequest = await tx.restaurantRequest.update({
        where: {
          id
        },
        data: {
          status: 'approved'
        }
      })
      
      return { restaurant, updatedRequest, user };
    })

    // Send approval email to requester
    if (restaurantRequest?.ownerEmail) {
      await sendMail({
        to: restaurantRequest.ownerEmail,
        subject: 'Seu restaurante foi aprovado! - FastTable',
        html: emailTemplate({
          title: 'Restaurante aprovado',
          message: `Olá ${restaurantRequest.ownerName || restaurantRequest.name},<br/>Seu pedido de restaurante <b>${restaurantRequest.name}</b> foi aprovado!<br/>Você já pode acessar o sistema com seu email e senha cadastrados.`
        })
      });
    }
    
    return NextResponse.json({
      message: 'Solicitação aprovada com sucesso',
      restaurant: result.restaurant,
      request: result.updatedRequest
    })
    
  } catch (error) {
    console.error('Error approving restaurant request:', error)
    return NextResponse.json(
      { message: 'Erro ao aprovar solicitação de restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 