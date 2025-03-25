import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Protect /create route
  if (request.nextUrl.pathname.startsWith('/create')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Check if user is a restaurant owner
    if (token.userType !== 'restaurant') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/create/:path*']
} 