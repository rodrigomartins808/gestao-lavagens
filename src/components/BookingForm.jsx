import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import { Calendar } from 'lucide-react';

const BookingForm = ({ customerData, isMobile }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const dateOptions = [];
  const monthsPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const daysPT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const label = i === 1 ? `Amanhã (${d.getDate()} ${monthsPT[d.getMonth()]})` : `${daysPT[d.getDay()]}, ${d.getDate()} ${monthsPT[d.getMonth()]}`;
    dateOptions.push({ value: dateStr, label });
  }

  const chegadaOptions = [];
  for (let h = 8; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 19 && m > 30) continue;
      chegadaOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  const levantamentoOptions = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 8 && m === 0) continue; // começa às 08:30
      if (h === 20 && m > 30) continue;
      levantamentoOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  const [bookingForm, setBookingForm] = useState({
    nome: customerData ? customerData.nome : '',
    telemovel: customerData ? customerData.telemovel : '',
    matricula: (customerData && customerData.vehicles && customerData.vehicles.length > 0) ? customerData.vehicles[0].matricula : '',
    servico: 'Lavagem Completa',
    data_desejada: dateOptions[0].value,
    hora_chegada: '09:00',
    hora_levantamento: '12:00'
  });
  const [bookingStatus, setBookingStatus] = useState('');
  const [dayBookings, setDayBookings] = useState([]);

  useEffect(() => {
    if (!bookingForm.data_desejada) return;
    dataService.getBookingsByDate(bookingForm.data_desejada).then(data => {
      setDayBookings(data);
    }).catch(e => console.error("Erro a carregar vagas:", e));
  }, [bookingForm.data_desejada]);

  const SERVICE_DURATIONS = {
    'Lavagem Simples': 1,
    'Lavagem Completa': 1,
    'Revitalização de plásticos (internos e externos)': 3,
    'Higienização a Ozono': 2,
    'Remoção de bolor': 1,
    'Remoção calcário dos vidros': 1,
    'Higienização de Estofos': 12
  };

  const getServiceDuration = (servico) => SERVICE_DURATIONS[servico] || 1;

  const getServicePoints = (servico) => {
    if (!servico) return 30;
    if (servico.includes('Simples')) return 20;
    if (servico.includes('Gás')) return 10;
    return 30;
  };
  const MAX_POINTS = 60;

  const timeToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (m) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  const getPointsForSlot = (timeStr, bookings) => {
    const slotMin = timeToMinutes(timeStr);
    return bookings.reduce((sum, b) => {
      const bStart = timeToMinutes(b.hora_chegada);
      const bDuration = getServiceDuration(b.servico) * 30;
      const bEnd = bStart + bDuration;
      if (slotMin >= bStart && slotMin < bEnd) {
        return sum + getServicePoints(b.servico);
      }
      return sum;
    }, 0);
  };

  const isServiceAvailableAt = (servico, timeStr, bookings) => {
    if (!servico) return true;
    
    if (servico.includes('Estofos')) {
      const tMin = timeToMinutes(timeStr);
      if (tMin > timeToMinutes('14:30')) return false;
      const isMorning = tMin < timeToMinutes('13:00');
      const existingEstofos = bookings.filter(b => b.servico.includes('Estofos'));
      const hasMorning = existingEstofos.some(b => timeToMinutes(b.hora_chegada) < timeToMinutes('13:00'));
      const hasAfternoon = existingEstofos.some(b => timeToMinutes(b.hora_chegada) >= timeToMinutes('13:00'));
      if (isMorning && hasMorning) return false;
      if (!isMorning && hasAfternoon) return false;
    }

    const duration = getServiceDuration(servico);
    const startMin = timeToMinutes(timeStr);
    const requiredPts = getServicePoints(servico);

    for (let i = 0; i < duration; i++) {
      const currentSlotMin = startMin + i * 30;
      if (currentSlotMin >= timeToMinutes('20:00')) return false;
      const currentSlotStr = minutesToTime(currentSlotMin);
      if (getPointsForSlot(currentSlotStr, bookings) + requiredPts > MAX_POINTS) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (!isServiceAvailableAt(bookingForm.servico, bookingForm.hora_chegada, dayBookings)) {
      const firstAvailable = chegadaOptions.find(t => isServiceAvailableAt(bookingForm.servico, t, dayBookings));
      if (firstAvailable) {
        setBookingForm(prev => ({...prev, hora_chegada: firstAvailable}));
      }
    }
    
    const minLevantamento = minutesToTime(timeToMinutes(bookingForm.hora_chegada) + getServiceDuration(bookingForm.servico) * 30);
    if (timeToMinutes(bookingForm.hora_levantamento) < timeToMinutes(minLevantamento)) {
      setBookingForm(prev => ({...prev, hora_levantamento: minLevantamento}));
    }
  }, [dayBookings, bookingForm.servico, bookingForm.hora_chegada]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isServiceAvailableAt(bookingForm.servico, bookingForm.hora_chegada, dayBookings)) {
      alert("Lamentamos, mas essa hora de chegada acabou de esgotar. Por favor selecione outra.");
      return;
    }

    setBookingStatus('submitting');
    try {
      const formToSubmit = {
        ...bookingForm,
        matricula: bookingForm.matricula.replace(/\s+/g, '').toUpperCase(),
        periodo: `${bookingForm.hora_chegada} às ${bookingForm.hora_levantamento}`,
        cliente_id: customerData ? customerData.id : null
      };
      delete formToSubmit.hora_levantamento;
      delete formToSubmit.hora_chegada;

      await dataService.addBooking(formToSubmit);
      setBookingStatus('success');
      setBookingForm(prev => ({
        ...prev, 
        nome: customerData ? customerData.nome : '', 
        telemovel: customerData ? customerData.telemovel : '', 
        matricula: (customerData && customerData.vehicles && customerData.vehicles.length > 0) ? customerData.vehicles[0].matricula : '',
        hora_chegada: '09:00', 
        hora_levantamento: '12:00' 
      }));
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  if (bookingStatus === 'success') {
    return (
      <div style={{ background: '#f0fdf4', padding: '2rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Calendar size={48} color="#22c55e" /></div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534', marginBottom: '1rem' }}>Pedido Enviado!</h3>
        <p style={{ color: '#15803d', marginBottom: '2rem' }}>Obrigado. Receberá um contacto nosso em breve para confirmar a sua marcação.</p>
        <button onClick={() => setBookingStatus('')} style={{ background: 'white', color: '#166534', border: '1px solid #22c55e', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>Fazer Nova Marcação</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {!customerData && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Nome *</label>
            <input type="text" required value={bookingForm.nome} onChange={e => setBookingForm({...bookingForm, nome: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Telemóvel *</label>
            <input type="tel" required pattern="[0-9]{9}" placeholder="Ex: 912345678" value={bookingForm.telemovel} onChange={e => setBookingForm({...bookingForm, telemovel: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
          </div>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: (!customerData && !isMobile) ? '1fr 2fr' : (isMobile ? '1fr' : '1fr 1fr'), gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Matrícula *</label>
          <input type="text" placeholder="XX-XX-XX" required value={bookingForm.matricula} onChange={e => setBookingForm({...bookingForm, matricula: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%', textTransform: 'uppercase' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Serviço *</label>
          <select value={bookingForm.servico} onChange={e => setBookingForm({...bookingForm, servico: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', background: 'white', transition: 'border-color 0.2s', width: '100%', appearance: 'none' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
            <option>Lavagem Simples</option>
            <option>Lavagem Completa</option>
            <option>Higienização de Estofos</option>
            <option>Revitalização de plásticos (internos e externos)</option>
            <option>Higienização a Ozono</option>
            <option>Remoção de bolor</option>
            <option>Remoção calcário dos vidros</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Data *</label>
          <select required value={bookingForm.data_desejada} onChange={e => setBookingForm({...bookingForm, data_desejada: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27%239ca3af%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/></svg>") no-repeat right 0.75rem center/1.25rem white' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
            {dateOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Chegada *</label>
          <select required value={bookingForm.hora_chegada} onChange={e => setBookingForm({...bookingForm, hora_chegada: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27%239ca3af%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/></svg>") no-repeat right 0.75rem center/1.25rem white' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
            {chegadaOptions.map(t => {
              const available = isServiceAvailableAt(bookingForm.servico, t, dayBookings);
              return (
                <option key={t} value={t} disabled={!available}>
                  {t} {!available ? '(Esgotado)' : ''}
                </option>
              );
            })}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Levantamento *</label>
          <select required value={bookingForm.hora_levantamento} onChange={e => setBookingForm({...bookingForm, hora_levantamento: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27%239ca3af%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/></svg>") no-repeat right 0.75rem center/1.25rem white' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
            {levantamentoOptions.filter(t => timeToMinutes(t) >= timeToMinutes(bookingForm.hora_chegada) + getServiceDuration(bookingForm.servico) * 30).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {bookingStatus === 'error' && (
        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>Ocorreu um erro ao enviar o pedido. Tente novamente.</p>
      )}

      <button type="submit" disabled={bookingStatus === 'submitting'} style={{ marginTop: '0.5rem', background: 'var(--accent-red)', color: 'white', padding: '1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: bookingStatus === 'submitting' ? 'wait' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        {bookingStatus === 'submitting' ? 'A enviar...' : 'Confirmar Pedido'}
      </button>
    </form>
  );
};

export default BookingForm;
