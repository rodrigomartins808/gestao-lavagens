import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Droplets, Wrench, Calendar, MapPin, ChevronRight, User } from 'lucide-react';
import dataService from '../services/dataService';

export default function LandingPage() {
  const navigate = useNavigate();
  const [fuelPrices, setFuelPrices] = useState({ gasoleo: '1.49', gasolina: '1.69', gas: '0.89' });
  const [bookingForm, setBookingForm] = useState({
    nome: '',
    telemovel: '',
    matricula: '',
    servico: 'Lavagem Completa',
    data_desejada: '',
    periodo: 'Manhã'
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
      await dataService.addBooking(bookingForm);
      setBookingStatus('success');
      setBookingForm({
        nome: '',
        telemovel: '',
        matricula: '',
        servico: 'Lavagem Completa',
        data_desejada: '',
        periodo: 'Manhã'
      });
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
            GM
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, color: 'var(--text-primary)' }}>GarageM</h1>
        </div>
        <button 
          onClick={() => navigate('/cartao')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#334155', border: 'none', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
        >
          <User size={18} />
          Área de Cliente
        </button>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '4rem 5%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', lineHeight: '1.2' }}>O Melhor Cuidado <br/><span style={{ color: '#38bdf8' }}>Para o Seu Carro</span></h2>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '2.5rem' }}>
          Lavagem automóvel premium, mecânica rápida e combustível aos melhores preços. Tudo num só lugar.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' })} style={{ background: '#38bdf8', color: '#0f172a', padding: '1rem 2rem', borderRadius: '9999px', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Agendar Lavagem <ChevronRight size={20} />
          </button>
          <button onClick={() => document.getElementById('servicos').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '1rem 2rem', borderRadius: '9999px', fontWeight: 'bold', fontSize: '1.1rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
            Ver Serviços
          </button>
        </div>
      </section>

      {/* Preços em Direto */}
      <section style={{ padding: '3rem 5%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center', width: '100%', maxWidth: '1000px', marginTop: '-5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Fuel size={16} /> Gasóleo Simples</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>{fuelPrices.gasoleo}€</div>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Fuel size={16} /> Gasolina 95</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>{fuelPrices.gasolina}€</div>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Fuel size={16} /> GPL Auto</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>{fuelPrices.gas}€</div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" style={{ padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: '900', textAlign: 'center', marginBottom: '3rem' }}>Os Nossos Serviços</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '50px', height: '50px', background: 'rgba(56, 189, 248, 0.1)', color: '#0284c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Droplets size={24} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Lavagem Premium</h4>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>Desde uma lavagem simples exterior até a uma lavagem completa com aspiração e limpeza de interiores ao pormenor.</p>
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '50px', height: '50px', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <User size={24} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Serviços Especiais</h4>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>Polimentos, higienização a ozono, limpeza profunda de estofos e hidratação de peles para deixar o seu carro como novo.</p>
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Wrench size={24} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Mecânica Rápida</h4>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '1rem' }}>Mudança de óleo, travões, revisões periódicas e pequenos arranjos mecânicos feitos por profissionais.</p>
            <span style={{ display: 'inline-block', background: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Preço sob consulta</span>
          </div>

        </div>
      </section>

      {/* Marcações e Mapa */}
      <section id="agendar" style={{ padding: '4rem 5%', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>
          
          {/* Form */}
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Agendar Lavagem</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Preencha o formulário para fazer um pedido de marcação. A nossa equipa irá confirmar a disponibilidade por mensagem ou chamada.</p>
            
            {bookingStatus === 'success' ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#065f46', padding: '2rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Calendar size={48} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Pedido Enviado!</h4>
                <p>Recebemos o seu pedido com sucesso. Iremos entrar em contacto brevemente para confirmar a marcação.</p>
                <button onClick={() => setBookingStatus('')} style={{ marginTop: '1.5rem', background: 'white', color: '#065f46', border: '1px solid #10b981', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Fazer outro pedido</button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Nome *</label>
                    <input type="text" required value={bookingForm.nome} onChange={e => setBookingForm({...bookingForm, nome: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Telemóvel *</label>
                    <input type="tel" required value={bookingForm.telemovel} onChange={e => setBookingForm({...bookingForm, telemovel: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Matrícula (Opcional)</label>
                  <input type="text" placeholder="XX-XX-XX" value={bookingForm.matricula} onChange={e => setBookingForm({...bookingForm, matricula: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Serviço *</label>
                  <select value={bookingForm.servico} onChange={e => setBookingForm({...bookingForm, servico: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                    <option>Lavagem Simples</option>
                    <option>Lavagem Completa</option>
                    <option>Serviços Especiais</option>
                    <option>Mecânica Rápida</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Data *</label>
                    <input type="date" required min={minDate} value={bookingForm.data_desejada} onChange={e => setBookingForm({...bookingForm, data_desejada: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Período *</label>
                    <select value={bookingForm.periodo} onChange={e => setBookingForm({...bookingForm, periodo: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}>
                      <option>Manhã</option>
                      <option>Tarde</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={bookingStatus === 'submitting'} style={{ marginTop: '1rem', background: '#38bdf8', color: '#0f172a', padding: '1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: bookingStatus === 'submitting' ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
                  {bookingStatus === 'submitting' ? 'A enviar...' : 'Solicitar Marcação'}
                </button>
              </form>
            )}
          </div>

          {/* Map */}
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={28} color="#38bdf8" /> Onde Estamos</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Venha visitar-nos e deixe o seu carro nas mãos de profissionais.</p>
            <div style={{ width: '100%', height: '400px', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0 }} 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.626578051778!2d-9.1393!3d38.7223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQzJzIwLjMiTiA5wrAwOCcyMS41Ilc!5e0!3m2!1spt-PT!2spt!4v1620000000000!5m2!1spt-PT!2spt" 
                allowFullScreen>
              </iframe>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2rem 5%', textAlign: 'center' }}>
        <p>© {new Date().getFullYear()} GarageM. Todos os direitos reservados.</p>
        <button onClick={() => navigate('/privacidade')} style={{ background: 'none', border: 'none', color: '#cbd5e1', textDecoration: 'underline', cursor: 'pointer', marginTop: '0.5rem' }}>Política de Privacidade</button>
      </footer>
    </div>
  );
}
