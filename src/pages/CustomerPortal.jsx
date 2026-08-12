import React, { useState, useEffect } from 'react';
import { LogOut, Award, Calendar, Droplets } from 'lucide-react';
import dataService from '../services/dataService';
import CustomerCard from '../components/CustomerCard';

export default function CustomerPortal({ currentUser }) {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

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

        {/* Histórico Recente */}
        <div style={{ paddingBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
            <Calendar style={{ marginRight: '0.5rem', color: '#3b82f6' }} /> Histórico Recente
          </h3>
          
          <div className="card" style={{ padding: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
            {customerData.washes && customerData.washes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {customerData.washes.map(wash => (
                  <div key={wash.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1.25rem',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease'
                  }} className="hover:bg-opacity-10">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{wash.tipo_lavagem}</span>
                        {wash.carimbos_ganhos > 0 && (
                          <span style={{ 
                            background: 'rgba(234, 179, 8, 0.15)', 
                            color: '#b45309', 
                            fontSize: '0.75rem', 
                            padding: '0.25rem 0.6rem', 
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            fontWeight: 'bold'
                          }}>
                            <Award size={12} style={{ marginRight: '0.25rem' }} /> +1 Carimbo
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                         <Calendar size={14} style={{ marginRight: '0.3rem' }}/>
                        {new Date(wash.data || wash.criado_em || new Date()).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
                <div style={{ background: 'rgba(0,0,0,0.04)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Droplets size={24} color="#64748b" />
                </div>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Ainda não tem histórico de lavagens.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Faça a sua primeira lavagem e comece a acumular carimbos!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
