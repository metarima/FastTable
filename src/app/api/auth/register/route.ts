import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto';
import { sendMail } from '@/lib/emailer';
import { emailTemplate } from '@/lib/emailTemplate';

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // userType is ignored: public sign-up always creates a customer account
    const { name, email, password } = await req.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está registado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType: 'customer',
      },
    })

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;
    await sendMail({
      to: email,
      subject: 'Verifique o seu email - FastTable',
      html: emailTemplate({
        title: 'Confirme o seu email',
        message: `Olá ${name},<br/>Obrigado por se registar no FastTable!<br/>Por favor, clique no botão abaixo para verificar o seu email e ativar a sua conta.`,
        action: { label: 'Verificar Email', url: verifyUrl },
      }),
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'Utilizador criado com sucesso. Verifique o seu email para ativar a conta.', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar utilizador' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 