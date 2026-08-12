import React, { useState, useEffect } from 'react';
import * as dataService from '../services/dataService';
import logo from '../assets/logo.jpeg';

export default function LiveQueue() {
  const [washes, setWashes] = useState([]);
  const [time, setTime] = useState(new Date());

  // Auto-scroll logic for TV
  useEffect(() => {
    const scrollContainers = document.querySelectorAll('.auto-scroll-container');
    
    const scrollInterval = setInterval(() => {
      scrollContainers.forEach(container => {
        if (container.scrollHeight > container.clientHeight) {
          container.scrollTop += 1;
          if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
            setTimeout(() => { container.scrollTop = 0; }, 2000);
          }
        }
      });
    }, 50);

    return () => clearInterval(scrollInterval);
  }, [washes]);

  useEffect(() => {
    // Relógio e Data
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Carregar lavagens a cada 10 segundos
    const loadWashes = async () => {
      const data = await dataService.getActiveWashes();
      setWashes(data || []);
    };
    
    loadWashes();
    const fetchInterval = setInterval(loadWashes, 10000);
    return () => clearInterval(fetchInterval);
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  const emPreparacao = washes.filter(w => w.estado === 'em_preparacao');
  const finalizados = washes.filter(w => w.estado === 'finalizado');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src={logo} alt="Logo" style={{ height: '70px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' }}>Estado das Lavagens</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#0f172a', lineHeight: '1' }}>{time.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
          <div style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: '500' }}>
            {time.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '4rem', 
        padding: '0 2rem',
        height: 'calc(100vh - 145px)',
        overflow: 'hidden'
      }}>
        
        {/* COLUNA 1: EM PREPARAÇÃO */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '1rem', 
            padding: '1.5rem 2rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderLeft: '8px solid #3b82f6',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="animate-spin-slow">⏱️</span> Lavagem em Curso
            </h2>
            <div style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {emPreparacao.length}
            </div>
          </div>

          <div className="auto-scroll-container" style={{ flex: 1, overflowY: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', alignContent: 'start', paddingRight: '0.5rem', scrollBehavior: 'smooth' }}>
            {emPreparacao.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: '#64748b', fontSize: '1.5rem' }}>
                Nenhuma viatura em lavagem de momento.
              </div>
            ) : (
              emPreparacao.map(wash => (
                <div key={wash.id} style={{ 
                  background: '#ffffff', 
                  border: '2px solid #e2e8f0',
                  borderRadius: '1rem', 
                  padding: '1.25rem',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)'
                }}>
                  <div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '2px', lineHeight: '1', whiteSpace: 'nowrap' }}>
                      {(wash.matricula || '---').toUpperCase()}
                    </div>
                    {wash.marca_modelo && (
                      <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '600', marginTop: '0.25rem' }}>
                        {wash.marca_modelo} {wash.cor && `(${wash.cor})`}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <div style={{ fontSize: '1.1rem', color: '#334155', fontWeight: 'bold' }}>
                      {wash.tipo_lavagem}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        📥 {formatTime(wash.data)}
                      </div>
                      {wash.hora_pedida && (
                        <div style={{ fontSize: '0.95rem', color: '#ef4444', fontWeight: 'bold' }}>
                          ⏰ {wash.hora_pedida}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Pronto a Levantar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '1rem', 
            padding: '1.5rem 2rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderLeft: '8px solid #22c55e',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              ✅ Pronto a Levantar
            </h2>
            <div style={{ background: '#22c55e', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {finalizados.length}
            </div>
          </div>

          <div className="auto-scroll-container" style={{ flex: 1, overflowY: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', alignContent: 'start', paddingRight: '0.5rem', scrollBehavior: 'smooth' }}>
            {finalizados.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: '#64748b', fontSize: '1.5rem' }}>
                Nenhuma viatura a aguardar levantamento.
              </div>
            ) : (
              finalizados.map(wash => (
                <div key={wash.id} className="animate-pulse-border" style={{ 
                  background: '#f0fdf4', 
                  border: '4px solid #22c55e',
                  borderRadius: '1rem', 
                  padding: '1.25rem',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgb(34 197 94 / 0.2)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#166534', letterSpacing: '2px', lineHeight: '1', whiteSpace: 'nowrap' }}>
                      {(wash.matricula || '---').toUpperCase()}
                    </div>
                    {wash.marca_modelo && (
                      <div style={{ fontSize: '1rem', color: '#15803d', fontWeight: '600', marginTop: '0.25rem' }}>
                        {wash.marca_modelo} {wash.cor && `(${wash.cor})`}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '2px solid #bbf7d0', paddingTop: '0.5rem', marginTop: '0.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', color: '#166534', fontWeight: 'bold' }}>
                      {wash.tipo_lavagem}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.95rem', color: '#15803d', marginTop: '0.25rem' }}>
                      <span>📥 {formatTime(wash.data)}</span>
                      <span style={{fontWeight: 'bold'}}>✅ {formatTime(wash.data_finalizado || new Date())}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .85; }
        }
      `}} />
    </div>
  );
}
