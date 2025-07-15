'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function Home() {
  const { data: session } = useSession()
  const isRestaurantOwner = session?.user && (session.user as any).userType === 'restaurant'

  // State for top restaurants
  const [topRestaurants, setTopRestaurants] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/restaurants?top=3')
      .then(res => res.json())
      .then(data => setTopRestaurants(data))
      .catch(() => setTopRestaurants([]));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              FastTable
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/restaurants" className="text-gray-600 hover:text-primary">
                Restaurantes
              </Link>
              {session && isRestaurantOwner && (
                <Link href="/admin/restaurant-dashboard" className="text-gray-600 hover:text-primary font-semibold">
                  O seu restaurante
                </Link>
              )}
              {session ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile" className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-base">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        session.user?.name ? session.user.name.charAt(0).toUpperCase() : (
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                        )
                      )}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold hover:underline transition">{session.user?.name}</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-primary ml-2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/signin" className="text-gray-600 hover:text-primary">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/restaurant.png"
            alt="Restaurant background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="container-custom relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Encontre a sua próxima experiência gastronômica
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white">
              Encontre e reserve os melhores restaurantes da sua zona.
            </p>
            <div className="flex gap-4">
              <Link href="/restaurants" className="btn-primary">
                Ver Restaurantes
              </Link>
              {!isRestaurantOwner ? (
                <Link href="/restaurant/register" className="btn-secondary">
                  Tornar-se Parceiro
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">Como funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Encontrar</h3>
              <p className="text-gray-600">Pesquise por culinária, localização ou nome do restaurante.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Reservar</h3>
              <p className="text-gray-600">Faça reservas com apenas alguns cliques.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Aproveite</h3>
              <p className="text-gray-600">Experimente uma refeição incrível no restaurante escolhido.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Restaurants Slideshow Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Não sabe qual restaurante escolher? <span className="text-primary">Estes são os mais escolhidos!</span>
          </h2>
          {topRestaurants.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                loop
                autoplay={{ delay: 4000 }}
                className="rounded-2xl shadow-xl bg-white"
              >
                {topRestaurants.map((r) => (
                  <SwiperSlide key={r.id}>
                    <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                      <div className="w-full md:w-1/2 flex justify-center">
                        <div className="relative w-64 h-48 md:w-80 md:h-56 rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20">
                          <Image
                            src={r.imageUrl || '/images/restaurant-placeholder.jpg'}
                            alt={r.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-primary">{r.name}</h3>
                        <p className="text-lg text-gray-600 mb-2">{r.cuisine}</p>
                        <p className="text-gray-500 mb-4">Reservas: <span className="font-semibold text-blue-700">{r.reservationCount}</span></p>
                        <Link href={`/restaurants/${r.id}`} className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary/90 transition">
                          Ver Restaurante
                        </Link>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">Carregando restaurantes mais escolhidos...</div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Tem um Restaurante?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Junte-se ao FastTable para atingir mais clientes e simplificar o seu processo de reserva.
          </p>
          {isRestaurantOwner ? (
            <Link href="/create" className="btn-primary">
              Criar Restaurante
            </Link>
          ) : (
            <Link href="/restaurant/register" className="btn-primary">
              Começar agora!
            </Link>
          )}
        </div>
      </section>
    </div>
  )
} 