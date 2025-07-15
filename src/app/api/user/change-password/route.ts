import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/auth.config'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// POST change password
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const { currentPassword, newPassword } = await req.json()
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Palavra-passe atual e nova palavra-passe são obrigatórias' },
        { status: 400 }
      )
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'A nova palavra-passe deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        email: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }
    
    // Check if user has a password (not OAuth only)
    if (!user.password) {
      return NextResponse.json(
        { message: 'Esta conta não tem palavra-passe definida (login social)' },
        { status: 400 }
      )
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Palavra-passe atual incorreta' },
        { status: 400 }
      )
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({ 
      message: 'Palavra-passe alterada com sucesso'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { message: 'Erro ao alterar palavra-passe' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 