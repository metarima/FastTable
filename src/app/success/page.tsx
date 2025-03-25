import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reserva Confirmada!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            A sua reserva foi confirmada com sucesso. Enviámos um email com os detalhes da sua reserva.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/restaurants"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Voltar aos Restaurantes
          </Link>
        </div>

        <div className="mt-4">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Voltar à Página Inicial
          </Link>
        </div>
      </div>
    </div>
  )
} 