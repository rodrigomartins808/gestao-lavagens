import React, { useState } from 'react';
import { Phone, Award, Plus, Check, Bell, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import dataService from '../services/dataService';

const COLORS = {
  Preto: '#1a1a1a',
  Branco: '#f0f0f0',
  Cinzento: '#808080',
  Azul: '#2563eb',
  Vermelho: '#dc2626',
  Verde: '#16a34a',
  Amarelo: '#eab308',
  Bordeaux: '#7f1d1d',
  Prata: '#c0c0c0',
};

export default function CustomerCard({
  customer,
  vehicles = [],
  onRegisterWash,
  onNotifyReady,
  showActions = true,
}) {
  if (!customer) return null;

  const stamps = customer.carimbos_acumulados || 0;
  const valesDescontados = customer.vales_descontados || 0;
  const totalVales = Math.floor(stamps / 10);
  const valesDisponiveis = totalVales - valesDescontados;
  const isWinner = valesDisponiveis > 0;
  const carimbosAtuais = stamps % 10;
  
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const toggleHistory = async () => {
    if (!showHistory) {
      // Load history when opening
      const washes = await dataService.getWashesByCustomer(customer.id);
      setHistory(washes || []);
    }
    setShowHistory(!showHistory);
  };

  return (
    <div className="card customer-card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{customer.nome}</h3>
          <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>{customer.numero_cliente}</span>
        </div>
        <p style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          <Phone size={14} style={{ marginRight: '0.5rem' }} />
          {customer.telemovel}
        </p>
      </div>

      {/* Viaturas */}
      {vehicles.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Viaturas</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {vehicles.map((vehicle, idx) => (
              <span key={idx} style={{
                background: 'rgba(0,0,0,0.04)',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(0,0,0,0.08)'
              }}>
                <span
                  style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: COLORS[vehicle.cor] || '#ccc',
                    marginRight: '0.5rem',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.15)'
                  }}
                  title={vehicle.cor}
                ></span>
                {vehicle.marca} {vehicle.modelo} <span style={{ opacity: 0.5, margin: '0 0.5rem' }}>•</span> {vehicle.matricula}
                {showActions && onNotifyReady && (
                  <button
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: 'none',
                      color: '#2563eb',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '0.75rem',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNotifyReady(customer, vehicle);
                    }}
                    title="Notificar viatura pronta"
                  >
                    <Bell size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Carimbos */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Carimbos de Lavagem</h4>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 'bold' }}>{carimbosAtuais}/10</span>
        </div>
        <div className="stamp-grid">
          {Array.from({ length: 10 }).map((_, idx) => {
            const isActive = idx < carimbosAtuais;
            return (
              <div
                key={idx}
                className={`stamp ${isActive ? 'active' : ''}`}
              >
                {isActive && <Check size={20} className="text-white" />}
              </div>
            );
          })}
        </div>
        {isWinner && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
            borderRadius: '1rem', 
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.4), 0 4px 6px -2px rgba(217, 119, 6, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, transform: 'scale(2)' }}>
              <Award size={100} />
            </div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '1rem', 
              borderRadius: '50%',
              backdropFilter: 'blur(4px)' 
            }}>
              <Award size={32} />
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontWeight: '900', fontSize: '1.25rem', letterSpacing: '0.05em', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                VOUCHER DOURADO
              </div>
              <div style={{ fontSize: '1rem', lineHeight: '1.4', marginTop: '0.25rem', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                Tem <b>{valesDisponiveis} Vale{valesDisponiveis > 1 ? 's' : ''} de 20€</b> para usar em serviços especiais!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Histórico */}
      <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1.25rem' }}>
        <button 
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1', cursor: 'pointer', background: 'none', border: 'none' }}
          onClick={toggleHistory}
        >
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}><Clock size={16} style={{ marginRight: '0.5rem' }} /> Histórico Recente</span>
          {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {showHistory && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem 0' }}>Sem histórico de lavagens.</p>
            ) : (
              history.slice(0, 5).map(wash => {
                const wDate = new Date(wash.data);
                const vehicle = vehicles.find(v => v.id === wash.viatura_id);
                return (
                  <div key={wash.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        {wash.tipo_lavagem}
                        {wash.carimbos_ganhos > 0 && (
                          <span style={{ 
                            background: 'rgba(234, 179, 8, 0.15)', 
                            color: '#fef08a', 
                            fontSize: '0.65rem', 
                            padding: '0.15rem 0.4rem', 
                            borderRadius: '9999px',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            +1 <Award size={10} style={{ marginLeft: '0.15rem' }} />
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                        <Clock size={12} style={{ marginRight: '0.3rem' }}/>
                        {wDate.toLocaleDateString('pt-PT')} • {vehicle ? vehicle.matricula : 'S/Viatura'}
                      </div>
                    </div>
                    <div style={{ 
                      color: wash.carimbos_ganhos === 0 ? '#16a34a' : '#2563eb', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      background: wash.carimbos_ganhos === 0 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '0.375rem'
                    }}>
                      {(() => {
                        if (wash.carimbos_ganhos === 0) return 'Vale 20€ Usado';
                        if (wash.valor > 0) return `${wash.valor.toFixed(2)}€`;
                        
                        const t = wash.tipo_lavagem || '';
                        // Valores reais baseados na tabela de preços oficial
                        if (t.includes('Simples') || t.includes('Exterior')) return '8.50€';
                        if (t.includes('Interior')) return '9.50€';
                        if (t.includes('Completa')) return '15.00€';
                        if (t.includes('estofos') || t.includes('Estofos')) return '75.00€';
                        if (t.includes('plásticos')) return '25.00€';
                        if (t.includes('Ozono')) return '20.00€';
                        if (t.includes('bolor')) return '10.00€';
                        if (t.includes('calcário')) return '22.50€';
                        
                        return '--€';
                      })()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Footer Button */}
      {showActions && onRegisterWash && (
        <div style={{ marginTop: '1.5rem', paddingTop: '0.5rem' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', fontWeight: 'bold', borderRadius: '0.75rem' }}
            onClick={() => onRegisterWash(customer)}
          >
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            Registar Lavagem
          </button>
        </div>
      )}
    </div>
  );
}
