import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMail } from '@/lib/emailer';
import { emailTemplate } from '@/lib/emailTemplate';

export async function GET(req, { params }) {
  const { id: restaurantId } = params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date'); // YYYY-MM-DD
  if (!date) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 });
  }
  // Get all reservations for this restaurant on the given date
  const start = new Date(date + 'T00:00:00.000Z');
  const end = new Date(date + 'T23:59:59.999Z');
  const reservations = await prisma.reservation.findMany({
    where: {
      restaurantId,
      time: {
        gte: start,
        lte: end,
      },
    },
    include: { tables: true },
    orderBy: { time: 'asc' },
  });
  return NextResponse.json({ reservations });
}

export async function POST(req, { params }) {
  const { id: restaurantId } = params;
  const data = await req.json();
  const { name, email, phone, peopleCount, time, food } = data;
  if (!name || !peopleCount || !time) {
    return NextResponse.json({ error: 'Dados obrigatórios em falta.' }, { status: 400 });
  }
  // Find the restaurant
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId, published: true } });
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurante não encontrado.' }, { status: 404 });
  }
  // Get all table types, sorted by minSeats
  const tableTypes = await prisma.tableType.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { minSeats: 'asc' },
  });
  if (!tableTypes.length) {
    return NextResponse.json({ error: 'Nenhuma mesa configurada.' }, { status: 400 });
  }
  // Get the reservation duration from the restaurant (in hours)
  const durationHours = restaurant.reservationDuration || 2;
  const durationMs = durationHours * 60 * 60 * 1000;
  const halfDurationMs = durationMs / 2;
  // Calculate the window for the requested reservation
  const reqTime = new Date(time);
  const reqStart = new Date(reqTime.getTime() - halfDurationMs);
  const reqEnd = new Date(reqTime.getTime() + halfDurationMs);
  // Get reservations that overlap with the requested window
  const reservationsAtTime = await prisma.reservation.findMany({
    where: {
      restaurantId: restaurant.id,
      time: {
        lt: reqEnd,
      },
    },
    include: { tables: true },
  });
  // Filter out reservations that end before reqStart
  const overlappingReservations = reservationsAtTime.filter(r => {
    const rTime = new Date(r.time);
    const rStart = new Date(rTime.getTime() - halfDurationMs);
    const rEnd = new Date(rTime.getTime() + halfDurationMs);
    return rEnd > reqStart;
  });
  // Count used tables by type
  const used = {};
  for (const r of overlappingReservations) {
    for (const t of r.tables) {
      used[t.tableTypeId] = (used[t.tableTypeId] || 0) + t.quantity;
    }
  }
  // Try to assign the smallest available table(s)
  let assignedTableType = null;
  let assignedQuantity = 1;
  for (const t of tableTypes) {
    if (t.minSeats <= peopleCount && peopleCount <= t.maxSeats) {
      const available = t.quantity - (used[t.id] || 0);
      if (available > 0) {
        assignedTableType = t;
        break;
      }
    }
  }
  // If no exact fit, try next larger table
  if (!assignedTableType) {
    for (const t of tableTypes) {
      if (t.minSeats >= peopleCount) {
        const available = t.quantity - (used[t.id] || 0);
        if (available > 0) {
          assignedTableType = t;
          break;
        }
      }
    }
  }
  if (!assignedTableType) {
    return NextResponse.json({ error: 'Nenhuma mesa disponível para o horário e número de pessoas selecionados.' }, { status: 409 });
  }
  // Create reservation
  const reservation = await prisma.reservation.create({
    data: {
      restaurantId: restaurant.id,
      name,
      email,
      phone,
      peopleCount,
      time: reqTime,
      paid: false,
      food: food || null,
      tables: {
        create: [{ tableTypeId: assignedTableType.id, quantity: assignedQuantity }],
      },
    },
    include: {
      tables: { include: { tableType: true } },
    },
  });

  // Send confirmation email if email is provided
  if (email) {
    // Format reservation details
    const dateStr = reqTime.toLocaleDateString('pt-PT');
    const timeStr = reqTime.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    let foodDetails = '';
    if (Array.isArray(food) && food.length > 0) {
      foodDetails = '<ul style="margin:8px 0 0 16px;padding:0;">' + food.map((f: any) => `<li>${f.name} x${f.quantity} - €${(f.price * f.quantity).toFixed(2)}</li>`).join('') + '</ul>';
    }
    await sendMail({
      to: email,
      subject: 'Confirmação de Reserva - FastTable',
      html: emailTemplate({
        title: 'Obrigado por fazer uma reserva!',
        message: `Olá ${name},<br/>Sua reserva foi recebida com sucesso no restaurante <b>${restaurant.name}</b>.<br/><br/><b>Data:</b> ${dateStr}<br/><b>Hora:</b> ${timeStr}<br/><b>Nº de pessoas:</b> ${peopleCount}<br/>${foodDetails ? '<b>Menu escolhido:</b>' + foodDetails : ''}<br/>Se precisar alterar ou cancelar, por favor contacte o restaurante.`
      }),
    });
  }
  return NextResponse.json({ reservation });
} 