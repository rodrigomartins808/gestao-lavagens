import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Droplets, Wrench, Calendar, MapPin, ChevronRight, User, Flame, Phone, Clock, CheckCircle2 } from 'lucide-react';
import dataService from '../services/dataService';
import logo from '../assets/logo.jpeg';

export default function LandingPage() {
  const navigate = useNavigate();
  const [fuelPrices, setFuelPrices] = useState({ gasoleo: '1.49', gasolina: '1.69', gas: '0.89' });
  const [bookingForm, setBookingForm] = useState({
    nome: '',
    telemovel: '',
    matricula: '',
    servico: 'Lavagem Completa',
    data_desejada: '',
    hora_chegada: '09:00',
    hora_levantamento: '12:00'
  });
  const [bookingStatus, setBookingStatus] = useState('');

  // Get tomorrow's date for the min date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    async function loadPrices() {
      try {
        const prices = await dataService.getFuelPrices();
        setFuelPrices(prices);
      } catch (err) {
        console.error("Erro a carregar preços", err);
      }
    }
    loadPrices();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    try {
      const formToSubmit = {
        ...bookingForm,
        periodo: `${bookingForm.hora_chegada} às ${bookingForm.hora_levantamento}`
      };
      // remover campos extra antes de enviar, caso o addBooking passe tudo pro DB
      delete formToSubmit.hora_chegada;
      delete formToSubmit.hora_levantamento;

      await dataService.addBooking(formToSubmit);
      setBookingStatus('success');
      setBookingForm({
        nome: '',
        telemovel: '',
        matricula: '',
        servico: 'Lavagem Completa',
        data_desejada: '',
        hora_chegada: '09:00',
        hora_levantamento: '12:00'
      });
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#333333' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) 5%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="GarageM Logo" style={{ height: '60px', borderRadius: 'var(--radius-md)' }} />
        </div>
        
        <nav className="main-nav" style={{ display: 'flex', gap: 'var(--space-6)', fontWeight: '600', fontSize: '1rem', alignItems: 'center' }}>
          <a href="#sobre" style={{ color: '#333', textDecoration: 'none', transition: 'color 0.2s' }}>Sobre Nós</a>
          <a href="#servicos" style={{ color: '#333', textDecoration: 'none', transition: 'color 0.2s' }}>Serviços</a>
          <a href="#precos" style={{ color: '#333', textDecoration: 'none', transition: 'color 0.2s' }}>Combustível</a>
          <a href="#agendar" style={{ color: '#333', textDecoration: 'none', transition: 'color 0.2s' }}>Marcações</a>
        </nav>

        <button 
          onClick={() => navigate('/cartao')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#111827', border: '2px solid #e5e7eb', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#111827'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          <User size={18} />
          Área de Cliente
        </button>
      </header>

      {/* Hero Section */}
      <section style={{ paddingTop: 'var(--space-24)', paddingBottom: 'var(--space-16)', paddingLeft: '5%', paddingRight: '5%', backgroundColor: 'white', color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: '800', marginBottom: 'var(--space-4)', lineHeight: '1.1', maxWidth: '900px', letterSpacing: '-0.02em' }}>
          Desde sempre no centro de Famalicão, <span style={{ color: 'var(--accent-red)' }}>sempre ao seu lado.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '650px', marginBottom: 'var(--space-8)', lineHeight: '1.6' }}>
          Combustível, mecânica rápida e a melhor lavagem automóvel da cidade. Onde a confiança tem nome próprio.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-16)' }}>
          <button onClick={() => document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'var(--accent-red)', color: 'white', padding: '1rem 2.5rem', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '1.125rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Agendar Lavagem <ChevronRight size={20} />
          </button>
          <button onClick={() => document.getElementById('servicos').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'white', color: '#111827', padding: '1rem 2.5rem', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '1.125rem', border: '2px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#f9fafb'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}>
            Ver Serviços
          </button>
        </div>

        {/* Hero Image Placeholder */}
        <div style={{ width: '100%', maxWidth: '1200px', height: '500px', borderRadius: 'var(--radius-xl)', background: '#111827', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
          <p style={{ color: '#6b7280', fontSize: '1.25rem', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <span style={{ padding: '1rem', border: '2px dashed #374151', borderRadius: 'var(--radius-lg)' }}>[Fotografia do Posto / Edifício a colocar aqui]</span>
          </p>
        </div>
      </section>

      {/* Preços em Direto (Painel Digital) */}
      <section id="precos" style={{ padding: 'var(--space-12) 5%', backgroundColor: '#111827', color: 'white', borderTop: '4px solid var(--accent-red)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Cotação de Combustíveis</h2>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>Última atualização: Hoje • Preços podem variar no local</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.875rem', fontWeight: '600', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span> Preços em Tempo Real
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            <div style={{ background: '#1f2937', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid #374151' }}>
              <div style={{ color: '#9ca3af', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Fuel size={20} /> Gasóleo Simples</div>
              <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#f97316', fontFamily: 'monospace', letterSpacing: '-0.05em' }}>{fuelPrices.gasoleo}€</div>
            </div>
            <div style={{ background: '#1f2937', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid #374151' }}>
              <div style={{ color: '#9ca3af', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Fuel size={20} /> Gasolina 95</div>
              <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#f97316', fontFamily: 'monospace', letterSpacing: '-0.05em' }}>{fuelPrices.gasolina}€</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" style={{ padding: 'var(--space-24) 5%', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
          <div style={{ paddingRight: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', marginBottom: 'var(--space-6)', lineHeight: '1.1' }}>Mais do que um posto. Uma paragem obrigatória.</h2>
            <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: 'var(--space-4)', lineHeight: '1.7' }}>
              A GarageM não é apenas um local de passagem. O nosso edifício faz parte da história do centro de Famalicão há mais de 25 anos. Passámos por marcas internacionais como a BP e Prio, mas hoje orgulhamo-nos de ser um espaço com identidade própria e independente.
            </p>
            <p style={{ fontSize: '1.125rem', color: '#4b5563', lineHeight: '1.7' }}>
              Aqui, não é apenas mais um número. Conhecemos os nossos clientes pelo nome, sabemos o que o seu carro precisa e fazemos questão de manter essa proximidade humana. É essa confiança que nos mantém aqui todos os dias.
            </p>
          </div>
          <div style={{ position: 'relative', height: '100%', minHeight: '400px', background: '#e5e7eb', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12rem', fontWeight: '900', color: '#f3f4f6', zIndex: 0, userSelect: 'none', whiteSpace: 'nowrap' }}>
              est. 199X
            </div>
            <p style={{ color: '#9ca3af', fontWeight: '600', zIndex: 1, textAlign: 'center', padding: '1rem', border: '2px dashed #d1d5db', borderRadius: 'var(--radius-lg)' }}>
              [Placeholder para Fotografia Histórica / Edifício]
            </p>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" style={{ padding: 'var(--space-24) 5%', maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white' }}>
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', margin: 0 }}>Os nossos serviços</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Serviço Destaque (Lavagem) */}
          <div style={{ background: '#111827', color: 'white', padding: 'var(--space-12)', borderRadius: 'var(--radius-xl)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)', alignItems: 'center', borderBottom: '4px solid var(--accent-red)' }}>
            <div>
              <div style={{ width: '56px', height: '56px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
                <Droplets size={28} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: 'var(--space-4)' }}>Lavagem Automóvel Premium</h3>
              <p style={{ color: '#d1d5db', lineHeight: '1.7', fontSize: '1.125rem', marginBottom: 'var(--space-6)' }}>Desde uma lavagem simples exterior com produtos que protegem a pintura, até a uma lavagem completa com aspiração profunda e limpeza de interiores ao pormenor.</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600' }}><CheckCircle2 size={20} color="var(--accent-red)" /> Lavagem Exterior: <span style={{ color: '#9ca3af', fontWeight: '400' }}>A partir de X€ (sob consulta)</span></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600' }}><CheckCircle2 size={20} color="var(--accent-red)" /> Lavagem Completa: <span style={{ color: '#9ca3af', fontWeight: '400' }}>A partir de X€ (sob consulta)</span></li>
              </ul>
            </div>
            <div style={{ background: '#1f2937', height: '100%', minHeight: '300px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #4b5563' }}>
              <span style={{ color: '#6b7280' }}>[Placeholder Imagem Lavagem]</span>
            </div>
          </div>

          {/* Restantes Serviços */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            <div style={{ background: '#f9fafb', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '48px', height: '48px', background: 'white', color: '#111827', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Wrench size={24} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#111827' }}>Mecânica Rápida</h4>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '1.5rem' }}>Mudança de óleo, travões, revisões periódicas e pequenos arranjos mecânicos feitos com precisão.</p>
              <div style={{ display: 'inline-block', background: '#e5e7eb', color: '#374151', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '600' }}>Preço sob consulta</div>
            </div>

            <div style={{ background: '#f9fafb', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '48px', height: '48px', background: 'white', color: '#111827', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Flame size={24} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#111827' }}>Venda de Gás</h4>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '1.5rem' }}>Disponibilizamos garrafas de gás com possibilidade de entrega diretamente em sua casa.</p>
              <div style={{ display: 'inline-block', background: '#e5e7eb', color: '#374151', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '600' }}>Várias marcas disponíveis</div>
            </div>

            <div style={{ background: '#f9fafb', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '48px', height: '48px', background: 'white', color: '#111827', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Clock size={24} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#111827' }}>Serviços Especiais</h4>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '1.5rem' }}>Polimentos, higienização a ozono, limpeza profunda de estofos e tratamento de peles.</p>
              <div style={{ display: 'inline-block', background: '#e5e7eb', color: '#374151', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '600' }}>Preço sob marcação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marcações e Mapa */}
      <section id="agendar" style={{ padding: 'var(--space-24) 5%', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-16)' }}>
          
          {/* Form */}
          <div style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: 'var(--space-2)', color: '#111827' }}>Agendar Serviço</h3>
            <p style={{ color: '#4b5563', marginBottom: 'var(--space-8)', lineHeight: '1.6' }}>Preencha o formulário e garantimos o seu lugar. Entraremos em contacto para confirmar.</p>
            
            {bookingStatus === 'success' ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#065f46', padding: '2rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Calendar size={48} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Pedido Enviado!</h4>
                <p>Recebemos o seu pedido com sucesso. Iremos entrar em contacto brevemente.</p>
                <button onClick={() => setBookingStatus('')} style={{ marginTop: '1.5rem', background: 'white', color: '#065f46', border: '1px solid #10b981', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Fazer outro pedido</button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Nome *</label>
                    <input type="text" required value={bookingForm.nome} onChange={e => setBookingForm({...bookingForm, nome: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Telemóvel *</label>
                    <input type="tel" required value={bookingForm.telemovel} onChange={e => setBookingForm({...bookingForm, telemovel: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Matrícula (Opção)</label>
                    <input type="text" placeholder="XX-XX-XX" value={bookingForm.matricula} onChange={e => setBookingForm({...bookingForm, matricula: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Serviço *</label>
                    <select value={bookingForm.servico} onChange={e => setBookingForm({...bookingForm, servico: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', background: 'white', transition: 'border-color 0.2s', width: '100%', appearance: 'none' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'}>
                      <option>Lavagem Simples</option>
                      <option>Lavagem Completa</option>
                      <option>Serviços Especiais</option>
                      <option>Mecânica Rápida</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Data *</label>
                    <input type="date" required min={minDate} value={bookingForm.data_desejada} onChange={e => setBookingForm({...bookingForm, data_desejada: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Chegada *</label>
                    <input type="time" required step="1800" value={bookingForm.hora_chegada} onChange={e => setBookingForm({...bookingForm, hora_chegada: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', background: 'white', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Levantamento *</label>
                    <input type="time" required step="1800" value={bookingForm.hora_levantamento} onChange={e => setBookingForm({...bookingForm, hora_levantamento: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1.5px solid #d1d5db', outline: 'none', background: 'white', transition: 'border-color 0.2s', width: '100%' }} onFocus={e => e.target.style.borderColor = 'var(--accent-red)'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'var(--space-4)' }}>
                  <button type="submit" disabled={bookingStatus === 'submitting'} style={{ background: 'var(--accent-red)', color: 'white', padding: '0.875rem 2rem', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '1rem', border: 'none', cursor: bookingStatus === 'submitting' ? 'wait' : 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-red)'}>
                    {bookingStatus === 'submitting' ? 'A enviar...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Map & Contacts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827' }}><MapPin size={28} color="var(--accent-red)" /> Onde nos encontrar</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>Praça do Município, Vila Nova de Famalicão.<br/>Mesmo em frente à Câmara Municipal.</p>
            </div>
            <div style={{ width: '100%', height: '100%', minHeight: '300px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid #e5e7eb', background: '#e5e7eb' }}>
              <iframe 
                title="Google Maps Location"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0, minHeight: '300px' }} 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2983.33644033604!2d-8.5222014!3d41.4097486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDI0JzM1LjEiTiA4wrAzMScyMC4wIlc!5e0!3m2!1spt-PT!2spt!4v1620000000000!5m2!1spt-PT!2spt" 
                allowFullScreen>
              </iframe>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Completo */}
      <footer style={{ background: '#111827', color: '#d1d5db', padding: 'var(--space-16) 5% var(--space-8)', fontSize: '0.95rem', borderTop: '4px solid var(--accent-red)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
          
          <div>
            <img src={logo} alt="GarageM" style={{ height: '40px', borderRadius: '4px', filter: 'grayscale(100%) brightness(200%)', marginBottom: 'var(--space-4)' }} />
            <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: 'var(--space-4)', maxWidth: '280px' }}>
              O posto de abastecimento e serviços automóvel no coração de Famalicão. 
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Contactos</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} color="#9ca3af"/> Praça do Município, V.N. Famalicão</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={18} color="#9ca3af"/> <a href="tel:+351000000000" style={{ color: '#d1d5db', textDecoration: 'none' }}>+351 000 000 000</a> (Provisório)</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Horário (Provisório)</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#9ca3af' }}>
              <li><strong>Segunda a Sexta:</strong> 08:00 - 20:00</li>
              <li><strong>Sábados:</strong> 08:00 - 13:00</li>
              <li><strong>Domingos:</strong> Fechado</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Siga-nos</h4>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#d1d5db'}>Facebook</a>
              <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#d1d5db'}>Instagram</a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #374151', paddingTop: 'var(--space-8)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          <p>© {new Date().getFullYear()} GarageM. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button onClick={() => navigate('/privacidade')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#6b7280'}>Política de Privacidade</button>
            <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='#6b7280'}>Termos e Condições</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
