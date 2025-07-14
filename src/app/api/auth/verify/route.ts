import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-result?status=invalid', req.url));
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(new URL('/auth/verify-result?status=expired', req.url));
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });
  // Delete the token
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL('/auth/verify-result?status=success', req.url));
} 