import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as dataService from '../services/dataService';
import logo from '../assets/logo.jpeg';
import { Clock, CheckCircle, Car, AlertCircle } from 'lucide-react';

export default function CustomerTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wash, setWash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWashStatus = async () => {
    try {
      const data = await dataService.getWashById(id);
      if (data) {
        setWash(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWashStatus();
    const interval = setInterval(fetchWashStatus, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>A carregar estado...</div>;
  }

  if (error || !wash) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lavagem não encontrada</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>O link pode ter expirado ou estar incorreto.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>Voltar ao Início</button>
      </div>
    );
  }

  const steps = [
    { key: 'rececao', label: 'Receção', icon: <Car size={24} /> },
    { key: 'em_preparacao', label: 'Em Lavagem', icon: <Clock size={24} /> },
    { key: 'finalizado', label: 'Pronto a Levantar', icon: <CheckCircle size={24} /> },
  ];

  let currentStepIndex = 1; // Default to 'em_preparacao'
  if (wash.estado === 'finalizado') currentStepIndex = 2;
  if (wash.estado === 'entregue') currentStepIndex = 3; // Fully done

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <img src={logo} alt="Posto Gestão" style={{ height: '80px', borderRadius: '12px' }} />
      </div>

      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>Estado da Viatura</h1>
        <div style={{ fontSize: '2rem', fontWeight: '900', textAlign: 'center', letterSpacing: '2px', color: '#3b82f6', marginBottom: '0.25rem' }}>
          {(wash.matricula || '---').toUpperCase()}
        </div>
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', fontWeight: '500', marginBottom: '2rem', textTransform: 'capitalize' }}>
          {wash.data ? new Date(wash.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
          {/* Linha de progresso */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '23px', width: '4px', background: '#e2e8f0', zIndex: 0 }}></div>
          
          <div style={{ position: 'absolute', top: 0, left: '23px', width: '4px', background: '#3b82f6', zIndex: 1, 
            height: currentStepIndex === 1 ? '50%' : currentStepIndex >= 2 ? '100%' : '0%',
            transition: 'height 0.5s ease'
          }}></div>

          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            let color = '#94a3b8';
            if (isActive) color = '#3b82f6';
            if (step.key === 'finalizado' && currentStepIndex >= 2) color = '#22c55e'; // Verde no fim

            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
                <div style={{ 
                  width: '50px', height: '50px', 
                  borderRadius: '50%', 
                  background: isActive ? color : '#f1f5f9',
                  color: isActive ? 'white' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isCurrent ? `0 0 0 4px ${color}33` : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isActive ? '#0f172a' : '#94a3b8' }}>
                    {step.label}
                  </div>
                  {isCurrent && step.key === 'em_preparacao' && (
                    <div style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '500', animation: 'pulse 2s infinite' }}>A ser lavado neste momento...</div>
                  )}
                  {isCurrent && step.key === 'finalizado' && (
                    <div style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: 'bold' }}>Pode vir levantar a sua viatura!</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b' }}>
        <p>Esta página atualiza automaticamente.</p>
        {wash.hora_pedida && (
          <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#0f172a' }}>Hora prevista: {wash.hora_pedida}</p>
        )}
      </div>
      
    </div>
  );
}
