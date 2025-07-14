"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const messages = {
  success: {
    title: 'Email verificado com sucesso!',
    description: 'A sua conta foi ativada. Pode agora iniciar sessão.',
    color: 'text-green-600',
    icon: '✅',
  },
  expired: {
    title: 'Link expirado',
    description: 'O link de verificação expirou. Por favor, registe-se novamente ou peça um novo link.',
    color: 'text-yellow-600',
    icon: '⏰',
  },
  invalid: {
    title: 'Link inválido',
    description: 'O link de verificação não é válido. Por favor, verifique o email ou registe-se novamente.',
    color: 'text-red-600',
    icon: '❌',
  },
};

export default function VerifyResultPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'invalid';
  const msg = messages[status] || messages.invalid;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <div className="mb-4 text-5xl">{msg.icon}</div>
        <h1 className={`text-2xl font-bold mb-2 ${msg.color}`}>{msg.title}</h1>
        <p className="text-gray-700 mb-6 text-center">{msg.description}</p>
        <Link href="/auth/signin" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Iniciar Sessão</Link>
      </div>
      <div className="mt-8 text-gray-400 text-sm">&copy; {new Date().getFullYear()} FastTable</div>
    </div>
  );
} 