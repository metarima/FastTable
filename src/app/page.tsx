import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="Restaurant background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="container-custom relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Crie o seu restaurante sonho
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-black">
              Construa sua presença digital com um menu interativo e um sistema de reserva sem esforço.
            </p>
            <div className="flex gap-4">
              <Link href="/create" className="btn-primary">
                Começar
              </Link>
              <Link href="/explore" className="btn-secondary">
                Explorar Restaurantes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">Por que escolher FastTable?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Menu Interativo</h3>
              <p className="text-gray-600">Crie e gerencie seu menu digitalmente com facilidades de atualizações e apresentação atraente.</p>
            </div>
            <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sistema de Reserva</h3>
              <p className="text-gray-600">Permite que os clientes reserve mesas online de forma intuitiva e eficiente.</p>
            </div>
            <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Rápido e Confiável</h3>
              <p className="text-gray-600">Construído com tecnologia moderna para garantir que a presença digital do seu restaurante esteja sempre online e funcionando.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto a começar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de restaurantes que confiam em FastTable para gerenciar sua presença digital.
          </p>
          <Link href="/create" className="btn-secondary">
            Crie o seu restaurante!
          </Link>
        </div>
      </section>
    </div>
  )
} 