import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { sendMail } from '@/lib/emailer';
import { emailTemplate } from '@/lib/emailTemplate';

const prisma = new PrismaClient()

// POST - Create restaurant request
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ownerName, ownerEmail, password, restaurantName, restaurantDescription, restaurantAddress } = body
    
    // Validate required fields
    if (!ownerEmail) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!password) {
      return NextResponse.json(
        { message: 'Password é obrigatória' },
        { status: 400 }
      )
    }
    
    if (!restaurantName) {
      return NextResponse.json(
        { message: 'Nome do restaurante é obrigatório' },
        { status: 400 }
      )
    }
    
    if (!restaurantAddress) {
      return NextResponse.json(
        { message: 'Endereço do restaurante é obrigatório' },
        { status: 400 }
      )
    }
    
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail },
    })
    
    // Check if there's already a pending request with this email
    const existingRequest = await prisma.restaurantRequest.findFirst({
      where: { 
        ownerEmail: ownerEmail,
        status: 'pending'
      },
    })
    
    if (existingRequest) {
      return NextResponse.json(
        { message: 'Já existe uma solicitação pendente para este email' },
        { status: 400 }
      )
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create restaurant request
    const restaurantRequest = await prisma.restaurantRequest.create({
      data: {
        name: restaurantName,
        description: restaurantDescription,
        address: restaurantAddress,
        ownerName,
        ownerEmail,
        password: hashedPassword,
      },
    })

    // Notify all admins
    const admins = await prisma.user.findMany({ where: { userType: 'admin' } });
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    if (adminEmails.length > 0) {
      await Promise.all(adminEmails.map(email => sendMail({
        to: email,
        subject: 'Nova solicitação de restaurante - FastTable',
        html: emailTemplate({
          title: 'Nova solicitação de restaurante',
          message: `Um novo pedido de restaurante foi enviado:<br/><br/><b>Nome:</b> ${restaurantName}<br/><b>Proprietário:</b> ${ownerName || '-'}<br/><b>Email:</b> ${ownerEmail}<br/><b>Endereço:</b> ${restaurantAddress}<br/><b>Descrição:</b> ${restaurantDescription || '-'}<br/><br/>Acesse o painel de administração para aprovar ou rejeitar.`
        })
      })));
    }
    
    return NextResponse.json({
      message: 'Solicitação enviada com sucesso!',
      requestId: restaurantRequest.id,
    })
  } catch (error) {
    console.error('Error creating restaurant request:', error)
    return NextResponse.json(
      { message: 'Erro ao criar solicitação de restaurante' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 