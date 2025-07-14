import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

declare module "next-auth" {
  interface User {
    id: string;
    userType: string;
  }
  interface Session {
    user: User & {
      id: string;
      userType: string;
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Block login if email is not verified
        if (!user.emailVerified) {
          throw new Error('Por favor, verifique o seu email antes de iniciar sessão.')
        }

        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          userType: user.userType
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          userType: token.userType
        }
      }
    },
    async redirect({ url, baseUrl }) {
      // Default: Go to requested URL or base URL
      if (url.startsWith('/')) {
        // For relative URLs, we can redirect directly
        return `${baseUrl}${url}`
      } else if (url.startsWith(baseUrl)) {
        // For absolute URLs within our domain, we can redirect directly
        return url
      }
      // For any other URL, go to homepage
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
} 