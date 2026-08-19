import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Award, Calendar, Droplets } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dataService from '../services/dataService';
import BookingForm from '../components/BookingForm';
import CustomerCard from '../components/CustomerCard';

export default function CustomerPortal({ currentUser }) {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
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
          {/* Nova Marcação Inteligente */}
          <BookingForm customerData={customerData} isMobile={false} />
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <Link to="/privacidade" style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none' }}>Política de Privacidade</Link>
        </div>
      </main>
    </div>
  );
}
