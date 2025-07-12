"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import pt from "date-fns/locale/pt";

interface Reservation {
  id: string;
  name: string;
  peopleCount: number;
  time: string;
  paid: boolean;
  food: any[];
  tables: { tableType: { name: string; minSeats: number; maxSeats: number }; quantity: number }[];
}

interface TableType {
  id: string;
  name: string;
  minSeats: number;
  maxSeats: number;
  quantity: number;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableViewMode, setTableViewMode] = useState<'now' | 'time'>('now');
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [availableTables, setAvailableTables] = useState<{[id: string]: number}>({});

  // Table setup modal state
  const [tableInputs, setTableInputs] = useState([
    { name: "1-2 pessoas", minSeats: 1, maxSeats: 2, quantity: 0 },
    { name: "3-4 pessoas", minSeats: 3, maxSeats: 4, quantity: 0 },
    { name: "5-6 pessoas", minSeats: 5, maxSeats: 6, quantity: 0 },
  ]);
  const [customTable, setCustomTable] = useState({ name: "", minSeats: 0, maxSeats: 0, quantity: 0 });
  const [savingTables, setSavingTables] = useState(false);
  const [tableError, setTableError] = useState("");

  // Calculate available tables for the selected time
  useEffect(() => {
    if (!tableTypes.length) return;
    let timeToCheck = new Date();
    if (tableViewMode === 'time') {
      timeToCheck = new Date(selectedTime);
    }
    // Find reservations that overlap with the selected time (simple: same hour)
    const reservationsAtTime = reservations.filter(r => {
      const resTime = new Date(r.time);
      return resTime.getFullYear() === timeToCheck.getFullYear() &&
        resTime.getMonth() === timeToCheck.getMonth() &&
        resTime.getDate() === timeToCheck.getDate() &&
        resTime.getHours() === timeToCheck.getHours();
    });
    const used: {[id: string]: number} = {};
    for (const r of reservationsAtTime) {
      for (const t of r.tables || []) {
        used[t.tableType.id] = (used[t.tableType.id] || 0) + t.quantity;
      }
    }
    const avail: {[id: string]: number} = {};
    for (const t of tableTypes) {
      avail[t.id] = Math.max(0, t.quantity - (used[t.id] || 0));
    }
    setAvailableTables(avail);
  }, [tableTypes, reservations, tableViewMode, selectedTime]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/restaurants/my-restaurant/reservations").then((res) => res.json()),
      fetch("/api/restaurants/my-restaurant/tables").then((res) => res.json()),
    ])
      .then(([reservationsData, tablesData]) => {
        setReservations(reservationsData.reservations || []);
        setTableTypes(tablesData.tableTypes || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar reservas ou mesas");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Populate tableInputs from backend if available
    if (tableTypes.length > 0) {
      setTableInputs(tableTypes.filter(t => t.name !== "Custom"));
    }
  }, [tableTypes]);

  const handleTableInputChange = (idx, field, value) => {
    setTableInputs(inputs => inputs.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const handleCustomTableAdd = () => {
    if (!customTable.name || customTable.minSeats < 1 || customTable.maxSeats < customTable.minSeats || customTable.quantity < 1) {
      setTableError("Preencha todos os campos corretamente para a mesa personalizada.");
      return;
    }
    setTableInputs([...tableInputs, { ...customTable }]);
    setCustomTable({ name: "", minSeats: 0, maxSeats: 0, quantity: 0 });
    setTableError("");
  };

  const handleRemoveTable = (idx) => {
    setTableInputs(inputs => inputs.filter((_, i) => i !== idx));
  };

  const handleSaveTables = async () => {
    setSavingTables(true);
    setTableError("");
    try {
      const res = await fetch("/api/restaurants/my-restaurant/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableTypes: tableInputs }),
      });
      if (!res.ok) throw new Error("Erro ao guardar mesas");
      setShowTableModal(false);
      // Optionally, refresh tableTypes from backend
      window.location.reload();
    } catch (e) {
      setTableError(e.message || "Erro ao guardar mesas");
    } finally {
      setSavingTables(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-primary-dark transition-colors"
          onClick={() => setShowTableModal(true)}
        >
          Configurar Mesas
        </button>
      </div>
      {tableTypes.length === 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md">
          <strong>É necessário configurar as mesas antes de publicar o restaurante</strong>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Pesquisar por nome, prato ou mesa"
            className="w-full md:w-1/3 border rounded px-3 py-2 mb-4 md:mb-0"
            // onChange={...} // Add search logic if needed
          />
        </div>
        {loading ? (
          <div className="text-center py-10">A carregar reservas...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 21m5.25-4l.75 4m-7.5-4h10.5M4.5 21h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v12A2.25 2.25 0 004.5 21z" /></svg>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-700 mb-1">Nenhuma reserva encontrada</div>
                <div className="text-gray-500 text-sm">Não há reservas no momento.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pratos</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mesas</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 font-semibold">{r.name}</td>
                    <td className="px-4 py-2">
                      {Array.isArray(r.food) && r.food.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {r.food.map((f, i) => (
                            <li key={i}>{f.name} {f.quantity ? `x${f.quantity}` : ""}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {r.tables && r.tables.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {r.tables.map((t, i) => (
                            <li key={i}>{t.tableType.name} ({t.tableType.minSeats}-{t.tableType.maxSeats}) x{t.quantity}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{new Date(r.time).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {r.paid ? (
                        <span className="text-green-600 font-bold">Sim</span>
                      ) : (
                        <span className="text-red-500 font-bold">Não</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Available Tables Widget */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="font-semibold text-lg">Mesas Disponíveis</div>
          <div className="flex gap-2 items-center">
            <button
              className={`px-3 py-1 rounded ${tableViewMode === 'now' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTableViewMode('now')}
            >Agora</button>
            <button
              className={`px-3 py-1 rounded ${tableViewMode === 'time' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTableViewMode('time')}
            >Selecionar horário</button>
            {tableViewMode === 'time' && (
              <input
                type="datetime-local"
                className="border rounded px-2 py-1 ml-2"
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
                style={{ minWidth: 180 }}
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tableTypes.length === 0 ? (
            <div className="col-span-full text-gray-400 text-center">Nenhuma mesa configurada.</div>
          ) : (
            tableTypes.map(t => (
              <div key={t.id} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center border">
                <div className="font-semibold text-primary text-lg mb-1">{t.name}</div>
                <div className="text-gray-600 text-sm mb-2">{t.minSeats}-{t.maxSeats} pessoas</div>
                <div className="text-2xl font-bold mb-1">
                  {availableTables[t.id] ?? t.quantity} / {t.quantity}
                </div>
                <div className={`text-xs font-semibold ${availableTables[t.id] > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {availableTables[t.id] > 0 ? 'Disponível' : 'Esgotado'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Table Setup Modal (to be implemented next) */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowTableModal(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Configurar Mesas</h2>
            <div className="space-y-4 mb-4">
              {tableInputs.map((t, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Nome</label>
                    <input type="text" className="border rounded px-2 py-1 w-full" value={t.name} onChange={e => handleTableInputChange(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Mín</label>
                    <input type="number" className="border rounded px-2 py-1 w-16" value={t.minSeats} min={1} onChange={e => handleTableInputChange(idx, 'minSeats', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Máx</label>
                    <input type="number" className="border rounded px-2 py-1 w-16" value={t.maxSeats} min={t.minSeats} onChange={e => handleTableInputChange(idx, 'maxSeats', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Qtd</label>
                    <input type="number" className="border rounded px-2 py-1 w-16" value={t.quantity} min={0} onChange={e => handleTableInputChange(idx, 'quantity', parseInt(e.target.value))} />
                  </div>
                  <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => handleRemoveTable(idx)} title="Remover mesa">×</button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="font-semibold mb-2">Adicionar mesa personalizada</div>
              <div className="flex flex-wrap gap-2 mb-2 items-end">
                <input type="text" placeholder="Nome" className="border rounded px-2 py-1 flex-1" value={customTable.name} onChange={e => setCustomTable({ ...customTable, name: e.target.value })} />
                <input type="number" placeholder="Mín" className="border rounded px-2 py-1 w-16" value={customTable.minSeats} min={1} onChange={e => setCustomTable({ ...customTable, minSeats: parseInt(e.target.value) })} />
                <input type="number" placeholder="Máx" className="border rounded px-2 py-1 w-16" value={customTable.maxSeats} min={customTable.minSeats || 1} onChange={e => setCustomTable({ ...customTable, maxSeats: parseInt(e.target.value) })} />
                <input type="number" placeholder="Qtd" className="border rounded px-2 py-1 w-16" value={customTable.quantity} min={1} onChange={e => setCustomTable({ ...customTable, quantity: parseInt(e.target.value) })} />
                <button className="bg-primary text-white px-3 py-1 rounded" onClick={handleCustomTableAdd} type="button">Adicionar</button>
              </div>
              {tableError && <div className="text-red-500 text-sm mb-2">{tableError}</div>}
            </div>
            <button
              className="mt-4 w-full py-2 rounded bg-primary text-white font-bold shadow hover:bg-primary-dark transition-colors disabled:opacity-60"
              onClick={handleSaveTables}
              disabled={savingTables}
            >
              {savingTables ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 