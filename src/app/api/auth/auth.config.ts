import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
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
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
    async signIn({ user, account, profile }) {
      // No manual user update/creation needed for OAuth providers
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Patch emailVerified for Google users if not set
        if (account.provider === 'google' && !user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() }
          });
          token.emailVerified = new Date();
        }
        return {
          ...token,
          id: user.id,
          userType: user.userType,
          emailVerified: user.emailVerified || new Date()
        }
      }
      return token;
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