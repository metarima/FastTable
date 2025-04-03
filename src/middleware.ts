import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Allow admin setup page without authentication
  if (request.nextUrl.pathname === '/admin/setup') {
    return NextResponse.next()
  }

  // If no token (not logged in), redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Route user to appropriate dashboard on root access
  if (request.nextUrl.pathname === '/') {
    if (token.userType === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else if (token.userType === 'restaurant' || token.userType === 'restaurant_admin') {
      return NextResponse.redirect(new URL('/admin/restaurant-dashboard', request.url))
    }
    // For regular customers, allow access to homepage
    return NextResponse.next()
  }

  // Protect /create route - only restaurant owners
  if (request.nextUrl.pathname.startsWith('/create')) {
    if (token.userType !== 'restaurant') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Dashboard is a router, so allow it to handle the redirects
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next()
    }
    
    // Main admin dashboard - only for admins
    if (request.nextUrl.pathname.startsWith('/admin/dashboard') || 
        request.nextUrl.pathname.startsWith('/admin/users') || 
        request.nextUrl.pathname.startsWith('/admin/restaurants')) {
      if (token.userType !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    
    // Restaurant admin dashboard - only for restaurant owners/admins
    if (request.nextUrl.pathname.startsWith('/admin/restaurant-dashboard')) {
      if (token.userType !== 'restaurant' && token.userType !== 'restaurant_admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/create/:path*', '/admin/:path*']
} 