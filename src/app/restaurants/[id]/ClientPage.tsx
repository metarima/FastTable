'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

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

export default function RestaurantClientPage({ restaurant, menuByCategory, menuColor }: { restaurant: any, menuByCategory: Record<string, any[]>, menuColor: string }) {
  const [tab, setTab] = useState<'info' | 'menu' | 'reservas'>('info');
  const [reservationComplete, setReservationComplete] = useState(false);
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-white shadow-lg flex flex-col py-8 px-4" style={{ borderRight: `4px solid ${menuColor}` }}>
        <div className="mb-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4" style={{ borderColor: menuColor }}>
            <Image src={restaurant.imageUrl || '/images/restaurant-placeholder.jpg'} alt={restaurant.name} width={80} height={80} className="object-cover w-full h-full" />
          </div>
          <div className="mt-4 text-lg font-bold text-center" style={{ color: menuColor }}>{restaurant.name}</div>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setTab('info')} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'info' ? 'bg-gray-100' : ''}`} style={tab === 'info' ? { color: menuColor } : {}}>{icons.info} <span>Informações</span></button>
          <button onClick={() => setTab('menu')} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'menu' ? 'bg-gray-100' : ''}`} style={tab === 'menu' ? { color: menuColor } : {}}>{icons.menu} <span>Menu</span></button>
          <button onClick={() => setTab('reservas')} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'reservas' ? 'bg-gray-100' : ''}`} style={tab === 'reservas' ? { color: menuColor } : {}}>{icons.reservas} <span>Reservas</span></button>
        </nav>
        <div className="flex-1" />
        <a href="/" className="block mt-8 mb-2 px-4 py-2 rounded-lg text-center font-semibold text-blue-600 hover:bg-blue-50 transition-colors border border-blue-100">
          ← Voltar ao site
        </a>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-10">
        {tab === 'info' && (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
            <div className="relative w-full h-56 rounded-lg overflow-hidden mb-6">
              <Image src={restaurant.imageUrl || '/images/restaurant-placeholder.jpg'} alt={restaurant.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h1 className="text-3xl font-bold drop-shadow-lg">{restaurant.name}</h1>
                <div className="mt-1 flex flex-wrap gap-4 text-lg font-medium drop-shadow">
                  <span>{restaurant.cuisine}</span>
                  <span className="text-gray-200">{restaurant.address}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{restaurant.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              <p>Contacto: {restaurant.phone || 'Não disponível'}</p>
              <p>Email: {restaurant.email || 'Não disponível'}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-5 py-2 rounded-lg font-semibold text-white shadow"
              style={{ background: menuColor }}
            >
              Ver no Google Maps
            </a>
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
              <button className="px-8 py-3 rounded-lg font-bold text-white text-lg shadow-lg hover:opacity-90 transition" style={{ background: menuColor }}>
                Gosta do que vê? Reserve uma mesa agora!
              </button>
            </div>
          </div>
        )}
        {tab === 'reservas' && (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-2xl font-bold mb-6" style={{ color: menuColor }}>Reservas</h2>
            {!reservationComplete ? (
              <ReservationForm restaurantId={restaurant.id} menuColor={menuColor} onReservationComplete={() => setReservationComplete(true)} />
            ) : (
              <div className="w-full max-w-lg mx-auto text-center">
                <h3 className="text-2xl font-bold mb-4 text-primary">Obrigado por reservar connosco!</h3>
                <div className="bg-gray-50 rounded-lg p-6 shadow mb-4 text-left">
                  <div className="mb-2"><span className="font-semibold">Endereço:</span> {restaurant.address}</div>
                  <div className="mb-2"><span className="font-semibold">Telefone:</span> {restaurant.phone || 'Não disponível'}</div>
                  <div className="mb-2"><span className="font-semibold">Email:</span> {restaurant.email || 'Não disponível'}</div>
                  {restaurant.website && <div className="mb-2"><span className="font-semibold">Website:</span> <a href={restaurant.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{restaurant.website}</a></div>}
                </div>
                <div className="text-gray-700 mt-2">Se houver alguma questão, por favor contacte-nos.</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ReservationForm({ restaurantId, menuColor, onReservationComplete }: { restaurantId: string, menuColor: string, onReservationComplete: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreConfirm, setShowPreConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [menu, setMenu] = useState<any>({});
  const [foodSelection, setFoodSelection] = useState<{ [id: string]: number }>({});
  const [menuLoading, setMenuLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationDuration, setReservationDuration] = useState(2); // fallback if not fetched

  useEffect(() => {
    async function fetchMenu() {
      setMenuLoading(true);
      const res = await fetch(`/api/restaurants/${restaurantId}/menu`);
      if (res.ok) {
        const data = await res.json();
        const grouped: Record<string, any[]> = {};
        for (const item of data.menu) {
          const cat = item.category || 'Outros';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        }
        setMenu(grouped);
      }
      setMenuLoading(false);
    }
    fetchMenu();
  }, [restaurantId]);

  // Fetch reservations and reservation duration for the selected date
  useEffect(() => {
    if (!date) return;
    async function fetchReservations() {
      const res = await fetch(`/api/restaurants/${restaurantId}/reservations?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
        // Try to get reservation duration from the first reservation's restaurant if available
        if (data.reservations?.[0]?.restaurant?.reservationDuration) {
          setReservationDuration(data.reservations[0].restaurant.reservationDuration);
        }
      } else {
        setReservations([]);
      }
    }
    fetchReservations();
  }, [restaurantId, date]);

  // Generate time slots
  const timeSlots = [];
  for (let h = 12; h <= 22; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  // Filter time slots based on reservations and buffer
  function isSlotAvailable(slot: string) {
    if (!date) return true;
    // Calculate the slot's Date object
    const slotDate = new Date(`${date}T${slot}`);
    const durationMs = reservationDuration * 60 * 60 * 1000;
    const halfDurationMs = durationMs / 2;
    const slotStart = new Date(slotDate.getTime() - halfDurationMs);
    const slotEnd = new Date(slotDate.getTime() + halfDurationMs);
    // Check for overlap with any reservation
    for (const r of reservations) {
      const resTime = new Date(r.time);
      const resStart = new Date(resTime.getTime() - halfDurationMs);
      const resEnd = new Date(resTime.getTime() + halfDurationMs);
      if (resEnd > slotStart && resStart < slotEnd) {
        return false;
      }
    }
    return true;
  }
  const availableTimeSlots = timeSlots.filter(isSlotAvailable);

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  const handleFoodChange = (id: string, value: number) => {
    setFoodSelection((prev) => ({ ...prev, [id]: value }));
  };

  // Calculate total
  let total = 0;
  Object.entries(foodSelection).forEach(([id, qty]) => {
    if (qty > 0) {
      for (const items of Object.values(menu)) {
        const item = (items as any[]).find((i) => i.id === id);
        if (item) {
          total += item.price * qty;
          break;
        }
      }
    }
  });

  // Prepare food array for confirmation and submission
  const food: any[] = [];
  Object.entries(foodSelection).forEach(([id, qty]) => {
    if (qty > 0) {
      for (const items of Object.values(menu)) {
        const item = (items as any[]).find((i) => i.id === id);
        if (item) {
          food.push({ menuItemId: id, name: item.name, price: item.price, quantity: qty });
          break;
        }
      }
    }
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setError('');
    // Prevent past date
    if (date < minDate) {
      setError('Não pode reservar para uma data no passado.');
      return;
    }
    // Phone validation: must be exactly 9 digits
    if (!/^\d{9}$/.test(phone)) {
      setError('O número de telefone deve ter exatamente 9 dígitos.');
      return;
    }
    setShowPreConfirm(true);
  };

  const handleConfirmReservation = async () => {
    setLoading(true);
    setError('');
    try {
      const dateTime = new Date(`${date}T${time}`);
      const res = await fetch(`/api/restaurants/${restaurantId}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, peopleCount, time: dateTime.toISOString(), food }),
      });
      const data = await res.json();
      if (res.ok) {
        // Store all details for the modal before resetting form
        setReservationDetails({
          name,
          email,
          phone,
          date,
          // Format time as HH:mm
          time: time,
          peopleCount,
          food,
          total,
          ...data.reservation,
        });
        setShowSuccess(true);
        if (onReservationComplete) onReservationComplete();
        // Hide/disable form after reservation
        // (We will not reset the form fields here)
      } else {
        setError(data.error || 'Erro ao efetuar reserva.');
      }
    } catch (err) {
      setError('Erro ao efetuar reserva.');
    } finally {
      setLoading(false);
      setShowPreConfirm(false);
    }
  };

  // Hide form after reservation
  const formDisabled = showSuccess;

  // Add a derived state for date validity
  const isDateInPast = date && date < minDate;

  // Update date handler to clear error if date becomes valid
  const handleDateChange = (e: any) => {
    setDate(e.target.value);
    if (e.target.value >= minDate && error === 'Não pode reservar para uma data no passado.') {
      setError('');
    }
  };

  return (
    <>
      {!formDisabled && (
        <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input type="text" className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={phone}
              maxLength={9}
              onChange={e => {
                // Only allow digits and limit to 9
                const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                setPhone(digits);
              }}
              required
              pattern="\\d{9}"
              inputMode="numeric"
              placeholder="Telefone"
            />
            {/* Immediate feedback for phone number length */}
            {phone.length > 0 && phone.length < 9 && (
              <span style={{ color: 'red', fontSize: '0.9em' }}>O número deve ter 9 dígitos.</span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Data <span className="text-red-500">*</span>
              </label>
              <input type="date" className="w-full border rounded px-3 py-2" value={date} onChange={handleDateChange} min={minDate} required />
              {isDateInPast && (
                <div className="text-red-600 text-sm mt-1">Não pode reservar para uma data no passado.</div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <select className="w-full border rounded px-3 py-2" value={time} onChange={e => setTime(e.target.value)} required>
                <option value="">Selecione</option>
                {availableTimeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nº de pessoas <span className="text-red-500">*</span>
            </label>
            <input type="number" className="w-full border rounded px-3 py-2" value={peopleCount} onChange={e => setPeopleCount(Number(e.target.value))} min={1} max={20} required />
          </div>
          {/* Menu Selection */}
          <div>
            <label className="block text-lg font-bold mb-2" style={{ color: menuColor }}>Pré-selecione o menu (opcional)</label>
            {menuLoading ? (
              <div className="text-gray-400 text-sm">A carregar menu...</div>
            ) : Object.keys(menu).length === 0 ? (
              <div className="text-gray-400 text-sm">Este restaurante ainda não tem menu disponível.</div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {Object.entries(menu).map(([category, items]) => (
                  <div key={category}>
                    <div className="font-semibold text-base mb-1" style={{ color: menuColor }}>{category}</div>
                    <div className="space-y-2">
                      {(items as any[]).map(item => (
                        <div key={item.id} className="flex items-center gap-2 border-b pb-1">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded" />}
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">€{item.price.toFixed(2)}</div>
                          </div>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={foodSelection[item.id] || 0}
                            onChange={e => handleFoodChange(item.id, Math.max(0, Number(e.target.value)))}
                            className="w-16 border rounded px-2 py-1 text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Total */}
          {total > 0 && (
            <div className="text-right font-bold text-lg" style={{ color: menuColor }}>
              Total: €{total.toFixed(2)}
            </div>
          )}
          <button type="submit" className="w-full py-2 rounded font-bold text-white" style={{ background: menuColor, opacity: isDateInPast ? 0.5 : 1, cursor: isDateInPast ? 'not-allowed' : 'pointer' }} disabled={loading || isDateInPast}>{loading ? 'A reservar...' : 'Reservar agora'}</button>
          {error && !isDateInPast && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      )}
      {/* Pre-confirmation Modal */}
      {showPreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full relative animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: menuColor }}>Confirmar Reserva</h3>
            <div className="space-y-2 text-gray-700 text-lg">
              <div><span className="font-semibold">Nome:</span> {name}</div>
              {email && <div><span className="font-semibold">Email:</span> {email}</div>}
              {phone && <div><span className="font-semibold">Telefone:</span> {phone}</div>}
              <div><span className="font-semibold">Data:</span> {date}</div>
              <div><span className="font-semibold">Hora:</span> {time}</div>
              <div><span className="font-semibold">Nº de pessoas:</span> {peopleCount}</div>
              {food.length > 0 && (
                <div>
                  <span className="font-semibold">Menu escolhido:</span>
                  <ul className="list-disc ml-6 mt-1 text-base">
                    {food.map((f: any) => (
                      <li key={f.menuItemId}>{f.name} x{f.quantity} <span className="text-gray-500">€{(f.price * f.quantity).toFixed(2)}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {total > 0 && (
                <div className="font-bold mt-2" style={{ color: menuColor }}>Total: €{total.toFixed(2)}</div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 py-2 rounded font-bold text-white"
                style={{ background: menuColor }}
                onClick={handleConfirmReservation}
                disabled={loading}
              >
                {loading ? 'A reservar...' : 'Confirmar Reserva'}
              </button>
              <button
                className="flex-1 py-2 rounded font-bold border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200"
                onClick={() => setShowPreConfirm(false)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccess && reservationDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full relative animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: menuColor }}>Thank you for doing a reservation with us!</h3>
          </div>
        </div>
      )}
    </>
  );
} 