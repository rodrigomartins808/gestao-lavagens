import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as dataService from '../services/dataService';
import VirtualKeyboard from '../components/VirtualKeyboard';

export default function Login({ type = 'employee', onLogin }) {
  const [pin, setPin] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [telemovel, setTelemovel] = useState('');
  const [error, setError] = useState('');

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError('');
    const user = await dataService.loginStaff(pin);
    
    if (user) {
      if (type === 'admin' && user.role !== 'admin') {
        setError('Acesso negado. Apenas administradores.');
      } else if (type === 'employee' && user.role !== 'employee') {
        setError('Acesso negado. Apenas funcionários.');
      } else {
        onLogin(user);
      }
    } else {
      setError('PIN inválido.');
    }
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setError('');
    const customer = await dataService.loginCustomer(numeroCliente, telemovel);
    if (customer) {
      onLogin({ ...customer, role: 'customer' });
    } else {
      setError('Credenciais inválidas. Verifique o telemóvel e o número de cliente.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-8">
          {/* Placeholder para Logotipo Oficial */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              background: 'var(--accent-primary)', 
              color: 'white', 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              marginBottom: '0.5rem'
            }}>
              PG
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Posto Lavagem</h1>
          </div>
          <p className="subtitle text-lg text-gray-400">
            {type === 'admin' ? 'Acesso Restrito - Administração' : 
             type === 'customer' ? 'Área de Cliente' : 
             'Sistema de Fidelização - Equipa'}
          </p>
        </div>

        {error && <div className="error-message p-3 mb-4 bg-red-900/50 border border-red-500 rounded text-red-200">{error}</div>}

        {(type === 'admin' || type === 'employee') && (
          <form onSubmit={handleStaffLogin} className="space-y-6">
            <div className="form-group">
              <label className="text-gray-300 font-medium">PIN de Acesso</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Introduza o seu PIN (4 dígitos)"
                className="input input-lg w-full mt-2"
                required
              />
              <VirtualKeyboard 
                onKeyPress={(key) => setPin(prev => (prev.length < 4 ? prev + key : prev))}
                onBackspace={() => setPin(prev => prev.slice(0, -1))}
              />
            </div>
            <button type="submit" className="btn-primary btn-lg w-full py-4 text-lg font-bold shadow-lg shadow-blue-500/30">
              Entrar no Sistema
            </button>
          </form>
        )}

        {type === 'customer' && (
          <form onSubmit={handleCustomerLogin} className="space-y-6">
            <div className="form-group">
              <label className="text-gray-300 font-medium">Telemóvel (Login)</label>
              <input
                type="tel"
                value={telemovel}
                onChange={(e) => setTelemovel(e.target.value.trim())}
                placeholder="Ex: 912345678"
                className="input input-lg w-full mt-2"
                required
              />
            </div>
            <div className="form-group">
              <label className="text-gray-300 font-medium">Número de Cliente (Senha)</label>
              <input
                type="text"
                value={numeroCliente}
                onChange={(e) => setNumeroCliente(e.target.value.trim())}
                placeholder="Ex: CLI-1001"
                className="input input-lg w-full mt-2"
                required
              />
            </div>
            <button type="submit" className="btn-primary btn-lg w-full py-4 text-lg font-bold shadow-lg shadow-blue-500/30">
              Ver Meu Cartão Digital
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
