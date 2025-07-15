'use client';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import ReservationFlow, { TableConfig } from './ReservationFlow';
import dynamic from 'next/dynamic';

const icons = {
  info: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
  ),
  menu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
  ),
  reservas: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
};

// Standard tables always present
const standardTables: TableConfig[] = [
  { name: '1-2 pessoas', min: 1, max: 2, qtd: 10 },
  { name: '3-4 pessoas', min: 3, max: 4, qtd: 5 },
  { name: '5-6 pessoas', min: 5, max: 6, qtd: 5 },
];

function mergeTables(restaurantTables: TableConfig[] | undefined): TableConfig[] {
  if (!restaurantTables || !Array.isArray(restaurantTables)) return standardTables;
  // Ensure all standard tables are present (by min/max)
  const merged = [...restaurantTables];
  for (const std of standardTables) {
    if (!restaurantTables.some(t => t.min === std.min && t.max === std.max)) {
      merged.push(std);
    }
  }
  return merged;
}

export default function RestaurantClientPage({ restaurant, menuByCategory, menuColor, stats }: { restaurant: any, menuByCategory: Record<string, any[]>, menuColor: string, stats?: any }) {
  const [tab, setTab] = useState<'info' | 'menu' | 'reservas'>('info');
  const [reservationComplete, setReservationComplete] = useState(false);
  // Merge restaurant tables with standard tables
  const tables = mergeTables(restaurant.tables);
  console.log('ReservationFlow tables:', tables);

  const hasRecordedView = useRef(false);

  // Helper: get most popular menu items
  const mostPopularItems = stats?.mostPopularMenuItems || (stats?.mostPopularMenuItem ? [stats.mostPopularMenuItem] : []);
  
  // Debug logging
  console.log('Stats received:', stats);
  console.log('Most popular items:', mostPopularItems);

  // Record a view on mount
  useEffect(() => {
    if (!restaurant?.id) return;
    if (hasRecordedView.current) return;
    hasRecordedView.current = true;
    console.log('Recording view for restaurant', restaurant.id);
    fetch(`/api/restaurants/${restaurant.id}/view`, { method: 'POST' })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error('Failed to record view:', res.status, data);
        } else {
          console.log('View recorded successfully');
        }
      })
      .catch((err) => {
        console.error('Error recording view:', err);
      });
  }, [restaurant?.id]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-white shadow-lg flex flex-col py-8 px-4 border-r-2" style={{ borderColor: menuColor }}>
        <div className="mb-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4" style={{ borderColor: menuColor }}>
            <Image src={restaurant.imageUrl || '/images/restaurant-placeholder.jpg'} alt={restaurant.name} width={80} height={80} className="object-cover w-full h-full" />
          </div>
          <div className="mt-4 text-lg font-bold text-center" style={{ color: menuColor }}>{restaurant.name}</div>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setTab('info')} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'info' ? '' : ''}`} style={tab === 'info' ? { background: menuColor + '20', color: menuColor } : {}}>{icons.info} <span>Informações</span></button>
          <button onClick={() => setTab('menu')} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'menu' ? '' : ''}`} style={tab === 'menu' ? { background: menuColor + '20', color: menuColor } : {}}>{icons.menu} <span>Menu</span></button>
          <button onClick={() => setTab('reservas')} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'reservas' ? '' : ''}`} style={tab === 'reservas' ? { background: menuColor + '20', color: menuColor } : {}}>{icons.reservas} <span>Reservas</span></button>
        </nav>
        <div className="flex-1" />
        <a href="/" className="block mt-8 mb-2 px-4 py-2 rounded-lg text-center font-semibold hover:bg-opacity-10 transition-colors border" style={{ color: menuColor, borderColor: menuColor, background: menuColor + '10' }}>← Voltar ao site</a>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-10">
        {tab === 'info' && (
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-0 overflow-hidden">
            {/* Banner */}
            <div className="relative w-full h-64 md:h-80">
              <Image src={restaurant.imageUrl || '/images/restaurant-placeholder.jpg'} alt={restaurant.name} fill className="object-cover w-full h-full" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${menuColor}B3, transparent)` }} />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-2" style={{ color: menuColor }}>{restaurant.name}</h1>
                <div className="flex flex-wrap gap-6 text-lg font-medium drop-shadow">
                  <span>{restaurant.cuisine}</span>
                  <span className="text-gray-200">{restaurant.address}</span>
                </div>
              </div>
            </div>
            {/* Two-column info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10">
              {/* Left: Description & Contact */}
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: menuColor }}>Sobre o Restaurante</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{restaurant.description || 'Bem-vindo! Descubra todos os nossos produtos, menus e promoções.'}</p>
                <div className="mb-4">
                  <div className="text-gray-600 mb-1"><b>Contacto:</b> {restaurant.phone || 'Não disponível'}</div>
                  <div className="text-gray-600 mb-1"><b>Email:</b> {restaurant.email || 'Não disponível'}</div>
                </div>
                {/* Opening Hours */}
                {restaurant.openingHours && (
                  <div className="mb-4">
                    <div className="font-semibold mb-1" style={{ color: menuColor }}>Horário de Funcionamento:</div>
                    <ul className="text-gray-700 text-sm pl-2">
                      {Array.isArray(restaurant.openingHours)
                        ? restaurant.openingHours.map((entry: any) => (
                            <li key={entry.day} className="mb-1 flex gap-2">
                              <span className="w-20 font-medium">{entry.day}:</span>
                              <span>{entry.closed ? 'Fechado' : `${entry.open} - ${entry.close}`}</span>
                            </li>
                          ))
                        : Object.entries(restaurant.openingHours).map(([day, hours]: any) => (
                            <li key={day} className="mb-1 flex gap-2">
                              <span className="w-20 font-medium">{day}:</span>
                              <span>{typeof hours === 'object' ? (hours.closed ? 'Fechado' : `${hours.open} - ${hours.close}`) : hours || 'Fechado'}</span>
                            </li>
                          ))}
                    </ul>
                  </div>
                )}
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-5 py-2 rounded-lg font-semibold text-white shadow" style={{ background: menuColor }}>Ver no Google Maps</a>
              </div>
              {/* Right: Map & Most Popular Dish */}
              <div className="flex flex-col gap-8 items-center">
                {/* Map Preview */}
                <div className="w-full h-48 rounded-xl overflow-hidden shadow border" style={{ borderColor: menuColor }}>
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(restaurant.address)}&output=embed`}
                    allowFullScreen
                    aria-hidden="false"
                    tabIndex={0}
                  />
                </div>
                {/* Most Popular Menu Item(s) */}
                {mostPopularItems.length > 0 && (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="font-semibold mb-1" style={{ color: menuColor }}>Mais populares hoje</div>
                    <div className="flex gap-4 justify-center">
                      {mostPopularItems.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex flex-col items-center rounded-xl p-4 shadow w-36" style={{ background: menuColor + '10' }}>
                          {item.imageUrl && (
                            <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-full object-cover border-2 mb-2" style={{ borderColor: menuColor }} />
                          )}
                          <div className="text-base font-bold text-center mb-1" style={{ color: menuColor }}>{item.name}</div>
                          <div className="text-gray-600 text-sm text-center">{item.price ? `€${item.price.toFixed(2)}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {tab === 'menu' && (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: menuColor }}>Menu</h2>
            {Object.keys(menuByCategory).length === 0 && (
              <div className="text-gray-400 text-center py-8">Este restaurante ainda não tem menu disponível.</div>
            )}
            <div className="space-y-10">
              {Object.entries(menuByCategory).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-xl font-semibold mb-3" style={{ color: menuColor }}>{category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex gap-4 bg-gray-50 rounded-lg shadow-sm p-4">
                        {item.imageUrl && (
                          <div className="w-24 h-24 flex-shrink-0 relative rounded overflow-hidden">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-lg">{item.name}</span>
                            <span className="font-bold" style={{ color: menuColor }}>€{item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">{item.description}</p>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {item.tags.map((tag: string) => (
                                <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full" style={{ color: menuColor, background: menuColor + '22' }}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-10">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow transition-colors"
                onClick={() => setTab('reservas')}
              >
                Gosta do que vê? Reserve uma mesa agora!
              </button>
            </div>
          </div>
        )}
        {tab === 'reservas' && (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
            <ReservationFlow tables={tables} openingHours={restaurant.openingHours} reservationDuration={restaurant.reservationDuration} menuByCategory={menuByCategory} restaurant={restaurant} />
          </div>
        )}
      </main>
    </div>
  );
} 