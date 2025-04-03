import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth.config'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { userType: null },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      userType: session.user.userType,
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email
    })
  } catch (error) {
    console.error('Error fetching user type:', error)
    return NextResponse.json(
      { error: 'Erro ao obter tipo de utilizador' },
      { status: 500 }
    )
  }
} 