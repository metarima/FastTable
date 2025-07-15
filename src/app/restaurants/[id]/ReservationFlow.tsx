import React, { useState } from 'react';
import { addMinutes, format, isBefore, parse, setHours, setMinutes } from 'date-fns';

// Table config type
export type TableConfig = {
  name: string;
  min: number;
  max: number;
  qtd: number;
};

// SVG Table Illustrations
const TableSVG = ({ seats }: { seats: number }) => {
  if (seats === 2) {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80">
        <rect x="25" y="25" width="30" height="30" rx="8" fill="#f3f4f6" stroke="#bbb" strokeWidth="2" />
        <circle cx="20" cy="40" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
        <circle cx="60" cy="40" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
      </svg>
    );
  }
  if (seats === 4) {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80">
        <rect x="25" y="25" width="30" height="30" rx="8" fill="#f3f4f6" stroke="#bbb" strokeWidth="2" />
        <circle cx="20" cy="40" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
        <circle cx="60" cy="40" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
        <circle cx="40" cy="20" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
        <circle cx="40" cy="60" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
      </svg>
    );
  }
  if (seats === 6) {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80">
        <rect x="25" y="25" width="30" height="30" rx="8" fill="#f3f4f6" stroke="#bbb" strokeWidth="2" />
        <circle cx="20" cy="40" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
        <circle cx="60" cy="40" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
        <circle cx="40" cy="20" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
        <circle cx="40" cy="60" r="6" fill="#fff" stroke="#bbb" strokeWidth="2" />
        <circle cx="25" cy="25" r="4" fill="#fff" stroke="#bbb" strokeWidth="1.5" />
        <circle cx="55" cy="55" r="4" fill="#fff" stroke="#bbb" strokeWidth="1.5" />
      </svg>
    );
  }
  // For 'more' (question mark)
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <rect x="25" y="25" width="30" height="30" rx="8" fill="#f3f4f6" stroke="#bbb" strokeWidth="2" />
      <text x="40" y="52" textAnchor="middle" fontSize="40" fill="#bbb" fontFamily="monospace">?</text>
    </svg>
  );
};

const steps = [
  'Escolher Mesa',
  'Informações',
  'Menu (Opcional)',
  'Confirmação',
];

interface ReservationFlowProps {
  tables: TableConfig[];
  openingHours?: any;
  reservationDuration?: number;
  menuByCategory?: Record<string, any[]>;
  restaurant?: { id: string; name: string; address: string; phone: string; imageUrl?: string };
}

const ReservationFlow: React.FC<ReservationFlowProps> = ({ tables, openingHours, reservationDuration, menuByCategory, restaurant }) => {
  const [step, setStep] = useState(0);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showNoExtraPopup, setShowNoExtraPopup] = useState(false);
  const [extraPeople, setExtraPeople] = useState('');
  const [extraMessage, setExtraMessage] = useState<string | null>(null);
  const [showNoTableModal, setShowNoTableModal] = useState(false);
  const [noTableMessage, setNoTableMessage] = useState('');

  // Main table options (min 1-2, 3-4, 5-6)
  const mainTables = tables.filter(t => t.min <= 6);
  // Extra tables (min > 6)
  const extraTables = tables.filter(t => t.min > 6);

  // Progress bar width
  const progress = ((step + 1) / steps.length) * 100;

  // Handlers
  const handleTableSelect = (seats: number, available: boolean) => {
    if (!available) {
      setNoTableMessage('O restaurante não tem mesas disponíveis para este número de pessoas.');
      setShowNoTableModal(true);
      return;
    }
    setSelectedTable(seats);
    if (seats > 6) setShowExtraModal(false);
  };

  const handleMoreTables = () => {
    setShowExtraModal(true);
    setExtraPeople('');
    setExtraMessage(null);
  };

  const handleExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(extraPeople, 10);
    if (isNaN(num) || num <= 0) {
      setExtraMessage('Por favor, introduza um número válido.');
      return;
    }
    // Check if it's a standard table
    if (mainTables.some(t => num >= t.min && num <= t.max)) {
      setExtraMessage('Para esse número de pessoas escolha uma das mesas normais!');
      return;
    }
    // Check if it matches an extra table
    const found = extraTables.find(t => num >= t.min && num <= t.max);
    if (found) {
      setSelectedTable(num);
      setExtraMessage(`Mesa encontrada para ${num} pessoas!`);
      setTimeout(() => {
        setShowExtraModal(false);
        setExtraMessage(null);
        setExtraPeople('');
      }, 1000); // 1 second delay
      return;
    }
    setExtraMessage('Não há mesa disponível para esse número de pessoas.');
  };

  const handleNext = () => {
    if (step === 0 && selectedTable == null) return;
    if (step === 1 && !selectedSlot) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  // Step 1: Table selection UI
  const renderTableSelection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'center', flex: 1 }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, textAlign: 'center' }}>Reservas menu</h2>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 32,
          marginBottom: 32,
          width: '100%',
          maxWidth: 500,
        }}
      >
        {/* Top left: 1-2 pessoas */}
        {mainTables[0] && (
          <div
            onClick={() => handleTableSelect(mainTables[0].max, mainTables[0].qtd > 0)}
            style={{
              aspectRatio: '1 / 1',
              width: '100%',
              background: mainTables[0].qtd === 0 ? '#f3f4f6' : (selectedTable === mainTables[0].max ? '#e0e7ff' : '#fff'),
              border: mainTables[0].qtd === 0 ? '2px solid #ddd' : (selectedTable === mainTables[0].max ? '2.5px solid #2563eb' : '2px solid #bbb'),
              borderRadius: 18,
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: mainTables[0].qtd === 0 ? 'not-allowed' : 'pointer',
              opacity: mainTables[0].qtd === 0 ? 0.5 : 1,
              transition: 'all 0.15s',
              padding: 12,
              pointerEvents: mainTables[0].qtd === 0 ? 'auto' : 'auto',
            }}
            aria-disabled={mainTables[0].qtd === 0}
          >
            <TableSVG seats={mainTables[0].max} />
            <div style={{ fontWeight: 600, fontSize: 22, marginTop: 8, textAlign: 'center' }}>{mainTables[0].name}</div>
            {mainTables[0].qtd === 0 && <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Indisponível</div>}
          </div>
        )}
        {/* Top right: 3-4 pessoas */}
        {mainTables[1] && (
          <div
            onClick={() => handleTableSelect(mainTables[1].max, mainTables[1].qtd > 0)}
            style={{
              aspectRatio: '1 / 1',
              width: '100%',
              background: mainTables[1].qtd === 0 ? '#f3f4f6' : (selectedTable === mainTables[1].max ? '#e0e7ff' : '#fff'),
              border: mainTables[1].qtd === 0 ? '2px solid #ddd' : (selectedTable === mainTables[1].max ? '2.5px solid #2563eb' : '2px solid #bbb'),
              borderRadius: 18,
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: mainTables[1].qtd === 0 ? 'not-allowed' : 'pointer',
              opacity: mainTables[1].qtd === 0 ? 0.5 : 1,
              transition: 'all 0.15s',
              padding: 12,
              pointerEvents: mainTables[1].qtd === 0 ? 'auto' : 'auto',
            }}
            aria-disabled={mainTables[1].qtd === 0}
          >
            <TableSVG seats={mainTables[1].max} />
            <div style={{ fontWeight: 600, fontSize: 22, marginTop: 8, textAlign: 'center' }}>{mainTables[1].name}</div>
            {mainTables[1].qtd === 0 && <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Indisponível</div>}
          </div>
        )}
        {/* Bottom left: 5-6 pessoas */}
        {mainTables[2] && (
          <div
            onClick={() => handleTableSelect(mainTables[2].max, mainTables[2].qtd > 0)}
            style={{
              aspectRatio: '1 / 1',
              width: '100%',
              background: mainTables[2].qtd === 0 ? '#f3f4f6' : (selectedTable === mainTables[2].max ? '#e0e7ff' : '#fff'),
              border: mainTables[2].qtd === 0 ? '2px solid #ddd' : (selectedTable === mainTables[2].max ? '2.5px solid #2563eb' : '2px solid #bbb'),
              borderRadius: 18,
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: mainTables[2].qtd === 0 ? 'not-allowed' : 'pointer',
              opacity: mainTables[2].qtd === 0 ? 0.5 : 1,
              transition: 'all 0.15s',
              padding: 12,
              pointerEvents: mainTables[2].qtd === 0 ? 'auto' : 'auto',
            }}
            aria-disabled={mainTables[2].qtd === 0}
          >
            <TableSVG seats={mainTables[2].max} />
            <div style={{ fontWeight: 600, fontSize: 22, marginTop: 8, textAlign: 'center' }}>{mainTables[2].name}</div>
            {mainTables[2].qtd === 0 && <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Indisponível</div>}
          </div>
        )}
        {/* Bottom right: (Mais pessoas) */}
        <div
          onClick={handleMoreTables}
          style={{
            aspectRatio: '1 / 1',
            width: '100%',
            background: selectedTable && selectedTable > 6 ? '#e0e7ff' : '#fff',
            border: selectedTable && selectedTable > 6 ? '2.5px solid #2563eb' : '2px solid #bbb',
            borderRadius: 18,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
            padding: 12,
          }}
        >
          <TableSVG seats={7} />
          <div style={{ fontWeight: 600, fontSize: 22, marginTop: 8, textAlign: 'center' }}>(Mais pessoas)</div>
        </div>
      </div>
      {/* Modal for extra tables: now asks for number of people */}
      {showExtraModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, minWidth: 300, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: 16 }}>Quantas pessoas?</h3>
            <form onSubmit={handleExtraSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <input
                type="number"
                min={1}
                value={extraPeople}
                onChange={e => { setExtraPeople(e.target.value); setExtraMessage(null); }}
                style={{ padding: 8, fontSize: 18, borderRadius: 8, border: '1.5px solid #bbb', marginBottom: 12, width: 120, textAlign: 'center' }}
                placeholder="Nº de pessoas"
                autoFocus
              />
              <button type="submit" style={{ padding: '8px 24px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', marginBottom: 8 }}>Procurar mesa</button>
            </form>
            {extraMessage && <div style={{ color: extraMessage.includes('encontrada') ? '#16a34a' : '#e11d48', fontWeight: 500, marginTop: 8, textAlign: 'center' }}>{extraMessage}</div>}
            <button onClick={() => { setShowExtraModal(false); setExtraMessage(null); setExtraPeople(''); }} style={{ marginTop: 16, color: '#2563eb', background: 'none', border: 'none', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}
      {/* Modal for no table available */}
      {showNoTableModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Mesa Indisponível
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{noTableMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowNoTableModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Tiny popup if no extra tables */}
      {showNoExtraPopup && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '8px 16px', borderRadius: 8, zIndex: 20 }}>
          Estas são todas as mesas disponíveis!
        </div>
      )}
    </div>
  );

  // Add helper to get weekday string
  function getWeekdayString(date: Date) {
    return [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ][date.getDay()];
  }

  // Informações step: calendar + slots
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Map Portuguese days to English weekday keys
  const ptToEn = {
    'Domingo': 'sunday',
    'Segunda': 'monday',
    'Terça': 'tuesday',
    'Quarta': 'wednesday',
    'Quinta': 'thursday',
    'Sexta': 'friday',
    'Sábado': 'saturday',
  };

  function normalizeOpeningHours(openingHoursArr: any[]) {
    const obj: Record<string, any> = {};
    for (const entry of openingHoursArr) {
      const dayPt = entry.day as keyof typeof ptToEn;
      const en = ptToEn[dayPt];
      if (en) obj[en] = entry;
    }
    return obj;
  }

  const normalizedOpeningHours = Array.isArray(openingHours)
    ? normalizeOpeningHours(openingHours)
    : openingHours;

  // Generate slots for selected day
  let slots: string[] = [];
  if (normalizedOpeningHours && reservationDuration) {
    const weekday = getWeekdayString(selectedDate);
    const hours = normalizedOpeningHours[weekday];
    if (hours && hours.open && hours.close && !hours.closed) {
      // Parse open/close as HH:mm
      const [openH, openM] = hours.open.split(':').map(Number);
      const [closeH, closeM] = hours.close.split(':').map(Number);
      let start = setMinutes(setHours(selectedDate, openH), openM);
      let end = setMinutes(setHours(selectedDate, closeH), closeM);
      const durationMin = reservationDuration * 60;
      while (isBefore(addMinutes(start, durationMin), addMinutes(end, 1))) {
        const slotStart = format(start, 'HH:mm');
        const slotEnd = format(addMinutes(start, durationMin), 'HH:mm');
        slots.push(`${slotStart} - ${slotEnd}`);
        start = addMinutes(start, durationMin);
      }
    }
  }

  // Helper to check if a date is before today
  function isBeforeToday(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  // Calendar state (move to top level)
  const [calendarMonth, setCalendarMonth] = useState(selectedDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(selectedDate.getFullYear());

  function renderCalendar(month: number, setMonth: (m: number) => void, year: number, setYear: (y: number) => void) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <button onClick={() => setMonth(month - 1)}>{'<'}</button>
          <span style={{ fontWeight: 600 }}>{format(new Date(year, month, 1), 'MMMM yyyy')}</span>
          <button onClick={() => setMonth(month + 1)}>{'>'}</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }, (_, i) => <div key={'empty-' + i} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const thisDate = new Date(year, month, day);
            const disabled = isBeforeToday(thisDate);
            return (
              <button
                key={day}
                onClick={() => { if (!disabled) setSelectedDate(thisDate); }}
                disabled={disabled}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  background: selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year ? '#2563eb' : isToday(day) ? '#e0e7ff' : 'transparent',
                  color: disabled ? '#bbb' : selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year ? '#fff' : '#222',
                  border: 'none',
                  fontWeight: isToday(day) ? 600 : 400,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                }}
              >{day}</button>
            );
          })}
        </div>
      </div>
    );
  }

  // Form state and validation for Informações step
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  function validateName(name: string) {
    if (!name.trim()) return 'Nome é obrigatório';
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) return 'Nome só pode conter letras e espaços';
    return '';
  }
  function validateEmail(email: string) {
    if (!email.trim()) return 'Email é obrigatório';
    if (!/^.+@.+\..+$/.test(email)) return 'Email inválido';
    return '';
  }
  function validatePhone(phone: string) {
    if (!phone.trim()) return 'Telefone é obrigatório';
    if (!/^\d{9}$/.test(phone)) return 'Telefone deve ter 9 dígitos numéricos';
    return '';
  }

  function handleFormChange(field: 'name' | 'email' | 'phone', value: string) {
    if (field === 'name') {
      // Only allow letters (including accents) and spaces
      const filtered = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
      setFormName(filtered);
    }
    if (field === 'email') setFormEmail(value);
    if (field === 'phone') setFormPhone(value.replace(/\D/g, ''));
    setFormErrors(errors => ({ ...errors, [field]: undefined }));
  }

  function handleFormBlur(field: 'name' | 'email' | 'phone') {
    let error = '';
    if (field === 'name') error = validateName(formName);
    if (field === 'email') error = validateEmail(formEmail);
    if (field === 'phone') error = validatePhone(formPhone);
    setFormErrors(errors => ({ ...errors, [field]: error }));
  }

  function isFormValid() {
    return !validateName(formName) && !validateEmail(formEmail) && !validatePhone(formPhone);
  }

  const renderInformacoes = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Informações</h2>
      {/* Form fields (name, email, phone) */}
      <form style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320, marginBottom: 24 }} autoComplete="off">
        <input
          required
          placeholder="Nome *"
          value={formName}
          onChange={e => handleFormChange('name', e.target.value)}
          onBlur={() => handleFormBlur('name')}
          style={{ padding: 8, borderRadius: 6, border: formErrors.name ? '2px solid #e11d48' : '1.5px solid #bbb', fontSize: 16 }}
        />
        {formErrors.name && <div style={{ color: '#e11d48', fontSize: 13 }}>{formErrors.name}</div>}
        <input
          required
          placeholder="Email *"
          value={formEmail}
          onChange={e => handleFormChange('email', e.target.value)}
          onBlur={() => handleFormBlur('email')}
          style={{ padding: 8, borderRadius: 6, border: formErrors.email ? '2px solid #e11d48' : '1.5px solid #bbb', fontSize: 16 }}
        />
        {formErrors.email && <div style={{ color: '#e11d48', fontSize: 13 }}>{formErrors.email}</div>}
        <input
          required
          placeholder="Telefone *"
          value={formPhone}
          onChange={e => handleFormChange('phone', e.target.value)}
          onBlur={() => handleFormBlur('phone')}
          maxLength={9}
          inputMode="numeric"
          style={{ padding: 8, borderRadius: 6, border: formErrors.phone ? '2px solid #e11d48' : '1.5px solid #bbb', fontSize: 16 }}
        />
        {formErrors.phone && <div style={{ color: '#e11d48', fontSize: 13 }}>{formErrors.phone}</div>}
      </form>
      {/* Calendar and slots */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {renderCalendar(calendarMonth, setCalendarMonth, calendarYear, setCalendarYear)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Horários disponíveis</div>
          {slots.length === 0 && <div style={{ color: '#e11d48' }}>Fechado neste dia</div>}
          {slots.map(slot => {
            // Disable slot if it's today and slot start is before now
            let disabled = false;
            const now = new Date();
            if (
              selectedDate.toDateString() === now.toDateString()
            ) {
              const [slotStart] = slot.split(' - ');
              const [h, m] = slotStart.split(':').map(Number);
              const slotDate = new Date(selectedDate);
              slotDate.setHours(h, m, 0, 0);
              if (slotDate <= now) disabled = true;
            }
            return (
              <button
                key={slot}
                onClick={() => !disabled && setSelectedSlot(slot)}
                disabled={disabled}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: selectedSlot === slot ? '#2563eb' : '#f3f4f6',
                  color: disabled ? '#bbb' : selectedSlot === slot ? '#fff' : '#222',
                  border: selectedSlot === slot ? '2px solid #2563eb' : '1.5px solid #bbb',
                  fontWeight: 500,
                  fontSize: 16,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  marginBottom: 4,
                  opacity: disabled ? 0.6 : 1,
                }}
              >{slot}</button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Menu Picker (optional) state
  // menuByCategory will be passed as a prop (update ReservationFlowProps)
  // We'll use a map of itemId -> quantity
  const [menuSelections, setMenuSelections] = useState<{ [itemId: string]: number }>({});

  // Helper to update quantity
  function setMenuItemQuantity(itemId: string, qty: number) {
    setMenuSelections(prev => ({ ...prev, [itemId]: Math.max(0, qty) }));
  }

  // Calculate total price for selected menu items
  let total = 0;
  if (menuByCategory) {
    for (const items of Object.values(menuByCategory)) {
      for (const item of items) {
        const qty = menuSelections[item.id] || 0;
        if (qty > 0) total += qty * item.price;
      }
    }
  }

  // Menu Picker UI
  function renderMenuPicker() {
    if (!menuByCategory || Object.keys(menuByCategory).length === 0) {
      return <div style={{ color: '#888', textAlign: 'center', margin: 32 }}>Este restaurante ainda não tem menu disponível.</div>;
    }
    return (
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ color: '#2563eb', fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Pré-selecione o menu (opcional)</h3>
        <div style={{ width: '100%', maxHeight: 320, overflowY: 'auto', marginBottom: 18, background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px #0001', padding: 8 }}>
          {Object.entries(menuByCategory).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 18 }}>
              <div style={{ color: '#2563eb', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{category}</div>
              {items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, background: '#f3f4f6', borderRadius: 8, padding: 8 }}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: '#666', fontSize: 14 }}>€{item.price.toFixed(2)}</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={menuSelections[item.id] || 0}
                    onChange={e => setMenuItemQuantity(item.id, parseInt(e.target.value) || 0)}
                    style={{ width: 40, textAlign: 'center', borderRadius: 6, border: '1.5px solid #bbb', fontSize: 16, padding: 4 }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        {total > 0 && (
          <div style={{ width: '100%', textAlign: 'right', fontWeight: 700, fontSize: 18, color: '#2563eb', marginBottom: 8 }}>
            Total: €{total.toFixed(2)}
          </div>
        )}
      </div>
    );
  }

  // Loading and success state for booking
  const [bookingState, setBookingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [reservationInfo, setReservationInfo] = useState<any>(null);

  // Helper to get selected table info
  const selectedTableObj = tables.find(t => t.max === selectedTable);

  // Helper to get selected slot start time (for API)
  function getSlotStartDate() {
    if (!selectedSlot) return null;
    // selectedSlot is like '09:00 - 10:00'
    const [start] = selectedSlot.split(' - ');
    const [h, m] = start.split(':').map(Number);
    const d = new Date(selectedDate);
    d.setHours(h, m, 0, 0);
    return d;
  }

  // Confirmation summary UI
  function renderConfirmation() {
    return (
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Confirmação</h2>
        <div style={{ width: '100%', background: '#f3f4f6', borderRadius: 10, padding: 18, marginBottom: 18 }}>
          <div><b>Restaurante:</b> {restaurant?.name}</div>
          <div><b>Mesa:</b> {selectedTableObj ? selectedTableObj.name : selectedTable}</div>
          <div><b>Data:</b> {selectedDate.toLocaleDateString()}</div>
          <div><b>Hora:</b> {selectedSlot}</div>
          <div><b>Nome:</b> {formName}</div>
          <div><b>Email:</b> {formEmail}</div>
          <div><b>Telefone:</b> {formPhone}</div>
          {total > 0 && (
            <div style={{ marginTop: 8 }}><b>Total menu:</b> €{total.toFixed(2)}</div>
          )}
          {/* Show selected menu items if any */}
          {total > 0 && (
            <div style={{ marginTop: 8 }}>
              <b>Menu selecionado:</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {Object.entries(menuSelections).filter(([_, qty]) => qty > 0).map(([itemId, qty]) => {
                  let item;
                  for (const items of Object.values(menuByCategory || {})) {
                    item = items.find((i: any) => i.id === itemId);
                    if (item) break;
                  }
                  return item ? <li key={itemId}>{item.name} x{qty}</li> : null;
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading screen
  function renderBookingLoading() {
    return (
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>A reservar...</div>
        <div style={{ width: 48, height: 48, border: '5px solid #2563eb', borderTop: '5px solid #e0e7ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Success screen
  function renderBookingSuccess() {
    return (
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        {restaurant?.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name} style={{ width: 90, height: 90, borderRadius: 16, objectFit: 'cover', marginBottom: 16, boxShadow: '0 2px 8px #0001' }} />
        )}
        <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>A sua reserva foi marcada!</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{restaurant?.name}</div>
        <div style={{ color: '#666', marginBottom: 8 }}>{restaurant?.address}</div>
        <div style={{ color: '#666', marginBottom: 18 }}>{restaurant?.phone}</div>
        <div style={{ color: '#2563eb', fontWeight: 500, marginBottom: 18 }}>Se tiver alguma dúvida, entre em contato connosco.<br />Não se esqueça de verificar o seu email para a confirmação!</div>
      </div>
    );
  }

  // Confirm reservation handler
  async function handleConfirmReservation() {
    setBookingState('loading');
    setBookingError(null);
    try {
      // Prepare reservation data
      const reservationData: any = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        peopleCount: selectedTable,
        time: getSlotStartDate(),
        restaurantId: restaurant?.id,
        food: Object.entries(menuSelections)
          .filter(([_, qty]) => qty > 0)
          .map(([itemId, qty]) => {
            let item;
            for (const items of Object.values(menuByCategory || {})) {
              item = items.find((i: any) => i.id === itemId);
              if (item) break;
            }
            return item ? {
              menuItemId: itemId,
              name: item.name,
              price: item.price,
              quantity: qty
            } : { menuItemId: itemId, quantity: qty };
          }),
      };
      // Call reservation API
      const res = await fetch(`/api/restaurants/${restaurant?.id}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      });
      if (!res.ok) throw new Error('Erro ao marcar reserva.');
      const data = await res.json();
      setReservationInfo(data.reservation);
      setBookingState('success');
      // Send confirmation email using the emailTemplate
      await fetch('/api/emailer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formEmail,
          subject: 'Confirmação de Reserva',
          html: `<h2>Confirmação de Reserva</h2>
            <p>Olá ${formName},</p>
            <p>Sua reserva em <b>${restaurant?.name}</b> foi confirmada para <b>${selectedDate.toLocaleDateString()}</b> às <b>${selectedSlot}</b>.</p>
            <p>Endereço: ${restaurant?.address}</p>
            <p>Telefone do restaurante: ${restaurant?.phone}</p>
            <p>Se tiver alguma dúvida, entre em contato connosco.</p>
            <p>Obrigado pela sua reserva!</p>`
        }),
      });
    } catch (err: any) {
      setBookingError(err.message || 'Erro ao marcar reserva.');
      setBookingState('error');
    }
  }

  // Step switch
  const renderStep = () => {
    if (step === 0) return renderTableSelection();
    if (step === 1) return renderInformacoes();
    if (step === 2) return renderMenuPicker();
    if (step === 3) {
      if (bookingState === 'loading') return renderBookingLoading();
      if (bookingState === 'success') return renderBookingSuccess();
      return (
        <>
          {renderConfirmation()}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button
              onClick={handleBack}
              style={{ opacity: 1, fontWeight: 500, fontSize: 16, background: 'none', border: 'none', color: '#888', cursor: 'pointer', borderRadius: 8, padding: '8px 32px' }}
              disabled={String(bookingState) === 'loading'}
            >Voltar</button>
            <button
              onClick={handleConfirmReservation}
              style={{ fontWeight: 700, fontSize: 16, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 32px', cursor: 'pointer' }}
              disabled={String(bookingState) === 'loading'}
            >Confirmar Reserva</button>
          </div>
        </>
      );
    }
    return null;
  };

  // Only show the reservation flow if not completed
  if (String(bookingState) === 'success') {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, background: '#fafafa', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {renderBookingSuccess()}
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24, background: '#fafafa', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Progress Bar and Steps */}
      {String(bookingState) !== 'success' && (
        <div style={{ marginBottom: 32 }}>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 6, marginBottom: 18, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: `${(step + 1) / steps.length * 100}%`,
              height: '100%',
              background: '#2563eb',
              borderRadius: 6,
              transition: 'width 0.3s',
            }} />
          </div>
          {/* Step Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
            {steps.map((label, idx) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', fontWeight: idx === step ? 700 : 500, color: idx === step ? '#2563eb' : '#888', fontSize: 16 }}>
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Step Content */}
      {renderStep()}
      {/* Navigation Buttons */}
      {(step !== 3) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button onClick={handleBack} disabled={step === 0} style={{ opacity: step === 0 ? 0.5 : 1, fontWeight: 500, fontSize: 16, background: 'none', border: 'none', color: '#888', cursor: step === 0 ? 'not-allowed' : 'pointer' }}>Voltar</button>
          <button
            onClick={handleNext}
            disabled={
              (step === 0 && selectedTable == null) ||
              (step === 1 && (!selectedSlot || !isFormValid()))
            }
            style={{
              fontWeight: 500,
              fontSize: 16,
              background: (
                (step === 0 && selectedTable == null) ||
                (step === 1 && (!selectedSlot || !isFormValid()))
              ) ? '#93c5fd' : '#2563eb',
              border: 'none',
              color: '#fff',
              cursor: (
                (step === 0 && selectedTable == null) ||
                (step === 1 && (!selectedSlot || !isFormValid()))
              ) ? 'not-allowed' : 'pointer',
              borderRadius: 8,
              padding: '8px 32px',
              transition: 'background 0.15s',
            }}
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationFlow; 