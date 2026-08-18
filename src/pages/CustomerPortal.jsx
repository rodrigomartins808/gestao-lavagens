import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Award, Calendar, Droplets } from 'lucide-react';
import dataService from '../services/dataService';
import CustomerCard from '../components/CustomerCard';

export default function CustomerPortal({ currentUser }) {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingForm, setBookingForm] = useState({
    servico: 'Lavagem Completa',
    data_desejada: '',
    periodo: 'Manhã',
    matricula: ''
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    try {
      await dataService.addBooking({
        nome: customerData.nome,
        telemovel: customerData.telemovel,
        matricula: bookingForm.matricula || (customerData.vehicles && customerData.vehicles.length > 0 ? customerData.vehicles[0].matricula : ''),
        servico: bookingForm.servico,
        data_desejada: bookingForm.data_desejada,
        periodo: bookingForm.periodo,
        cliente_id: customerData.id
      });
      setBookingStatus('success');
      setBookingForm({ ...bookingForm, data_desejada: '' });
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };


  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        if (currentUser && currentUser.id) {
          const data = await dataService.getCustomerById(currentUser.id);
          setCustomerData(data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [currentUser]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>A carregar os seus dados...</div>;
  }

  if (!customerData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '1rem' }}>Erro de Acesso</h2>
          <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>Não foi possível carregar os dados do seu perfil.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Voltar ao Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="portal min-h-screen">
      <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {(() => {
              const name = customerData.nome.split(' ')[0];
              const lower = name.toLowerCase();
              const isFemale = (lower.endsWith('a') && !['luca', 'andrea'].includes(lower)) || 
                               ['inês', 'beatriz', 'leonor', 'alice', 'raquel', 'isabel', 'carmen', 'miriam'].includes(lower);
              return isFemale ? `Bem-vinda, ${name}!` : `Bem-vindo, ${name}!`;
            })()}
          </h2>
          <p style={{ color: '#94a3b8' }}>Acompanhe o seu cartão de fidelização e histórico de lavagens.</p>
        </div>

        {/* Cartão de Fidelização */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
            <Award style={{ marginRight: '0.5rem', color: '#eab308' }} /> O Seu Cartão
          </h3>
          <CustomerCard 
            customer={customerData}
            vehicles={customerData.vehicles}
            showActions={false}
          />
        </div>

        {/* Marcações */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
            <Calendar style={{ marginRight: '0.5rem', color: '#38bdf8' }} /> Pedir Marcação
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Os seus dados (nome e telemóvel) serão enviados automaticamente. A nossa equipa entrará em contacto para confirmar.</p>
          
          {bookingStatus === 'success' ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#065f46', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Pedido Enviado com Sucesso!</p>
              <button onClick={() => setBookingStatus('')} style={{ background: 'white', color: '#065f46', border: '1px solid #10b981', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.875rem' }}>Novo Pedido</button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

              <button type="submit" disabled={bookingStatus === 'submitting'} style={{ marginTop: '0.5rem', background: '#38bdf8', color: '#0f172a', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: bookingStatus === 'submitting' ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
                {bookingStatus === 'submitting' ? 'A enviar...' : 'Solicitar Marcação'}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <Link to="/privacidade" style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none' }}>Política de Privacidade</Link>
        </div>
      </main>
    </div>
  );
}
