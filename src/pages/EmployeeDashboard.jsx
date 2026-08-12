import React, { useState, useEffect } from 'react';
import { LogOut, Bell, CheckCircle, Clock, User, PlusCircle, Car, Play, Check, Search, Phone, Award } from 'lucide-react';
import dataService from '../services/dataService';
import whatsappService from '../services/whatsappService';
import QuickSearch from '../components/QuickSearch';
import CustomerCard from '../components/CustomerCard';
import NewCustomerModal from '../components/NewCustomerModal';
import AddVehicleModal from '../components/AddVehicleModal';

export default function EmployeeDashboard({ currentUser }) {
  const [stats, setStats] = useState({ totalWashes: 0, totalRevenue: 0, newCustomers: 0 });
  const [activeWashes, setActiveWashes] = useState([]);
  const [activeTab, setActiveTab] = useState('producao'); // producao | clientes
  
  // Entry Form State
  const [entry, setEntry] = useState({
    telemovel: '',
    matricula: '',
    tipo_servico: 'Lavagem Exterior',
    hora_pedida: '',
    marca_modelo: '',
    cor: ''
  });
  const [detectedCustomer, setDetectedCustomer] = useState(null);
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);

  // Delivery Modal State
  const [deliveryWash, setDeliveryWash] = useState(null);
  const [deliveryCustomer, setDeliveryCustomer] = useState(null);
  const [createProfile, setCreateProfile] = useState(false);
  const [profileData, setProfileData] = useState({ nome: '', nif: '' });

  // Customer Management State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  // Ready Modal State
  const [readyWash, setReadyWash] = useState(null);
  const [botStatus, setBotStatus] = useState({ online: true, lastSeen: null });

  const loadDashboardData = async () => {
    try {
      const washes = await dataService.getActiveWashes();
      setActiveWashes(washes || []);
      
      const todayStats = await dataService.getTodayStats();
      setStats(todayStats || { totalWashes: 0, totalRevenue: 0, newCustomers: 0 });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleSelectCustomer = async (customer) => {
    try {
      const fullCustomer = await dataService.getCustomerById(customer.id);
      setSelectedCustomer(fullCustomer);
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
    }
  };

  const handleCreateNewCustomer = (query) => {
    setSearchQuery(query);
    setIsNewCustomerOpen(true);
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkBotStatus = async () => {
      try {
        const { data, error } = await supabase.from('bot_status').select('*').single();
        if (!error && data) {
          const lastActive = new Date(data.last_active).getTime();
          const now = Date.now();
          const isOnline = (now - lastActive) < 60000; // 1 minuto
          setBotStatus({ online: isOnline, lastSeen: data.last_active });
        } else {
          setBotStatus(prev => ({ ...prev, online: false }));
        }
      } catch (err) {
        setBotStatus(prev => ({ ...prev, online: false }));
      }
    };
    checkBotStatus();
    const interval = setInterval(checkBotStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-detect customer
  useEffect(() => {
    const detect = async () => {
      if (entry.telemovel.length >= 9 || entry.matricula.length >= 6) {
        const query = entry.telemovel || entry.matricula;
        const results = await dataService.searchCustomers(query);
        if (results && results.length > 0) {
          // Find an exact match for phone or plate
          const match = results.find(c => 
            c.telemovel === entry.telemovel || 
            (c.vehicles && c.vehicles.some(v => v.matricula.toUpperCase() === entry.matricula.toUpperCase()))
          );
          setDetectedCustomer(match || null);
        } else {
          setDetectedCustomer(null);
        }
      } else {
        setDetectedCustomer(null);
      }
    };
    const timeoutId = setTimeout(detect, 500);
    return () => clearTimeout(timeoutId);
  }, [entry.telemovel, entry.matricula]);

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    if (!entry.telemovel || !entry.matricula) {
      alert("Telemóvel e Matrícula são obrigatórios!");
      return;
    }
    
    setIsSubmittingEntry(true);
    try {
      const newWash = await dataService.registerWashEntry({
        ...entry,
        cliente_id: detectedCustomer ? detectedCustomer.id : null,
      });
      
      // WhatsApp Tracking Message
      const baseUrl = window.location.hostname === 'localhost' ? 'https://garagemmlavagens.vercel.app' : window.location.origin;
      const trackingUrl = baseUrl + '/tracking/' + newWash.id;
      let welcomeMsg = `Olá! 🚗 O seu veículo (${entry.matricula.toUpperCase()}) acabou de dar entrada.\n`;
      welcomeMsg += `Serviço: *${entry.tipo_servico}*\n`;
      if (entry.hora_pedida) {
        welcomeMsg += `Hora Pedida: *${entry.hora_pedida}*\n`;
      }
      welcomeMsg += `\nPode acompanhar o estado da sua lavagem em tempo real aqui:\n ${trackingUrl} \n\nObrigado pela preferência! 💧`;
      
      whatsappService.openWhatsApp(entry.telemovel, welcomeMsg);
      
      // Reset form
      setEntry({
        telemovel: '',
        matricula: '',
        tipo_servico: 'Lavagem Exterior',
        hora_pedida: '',
        marca_modelo: '',
        cor: ''
      });
      setDetectedCustomer(null);
      loadDashboardData();
    } catch (error) {
      console.error("Erro a dar entrada:", error);
      alert("Erro ao registar a entrada da viatura.");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  const handleMarkAsDone = async (washId) => {
    // We don't do it directly anymore, we use the readyWash modal.
  };

  const handleOpenDelivery = async (wash) => {
    setDeliveryWash(wash);
    setCreateProfile(false);
    setProfileData({ nome: '', nif: '' });
    
    if (wash.cliente_id) {
      const customer = await dataService.getCustomerById(wash.cliente_id);
      setDeliveryCustomer(customer);
    } else {
      setDeliveryCustomer(null);
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    try {
      let finalCustomerId = deliveryWash.cliente_id;
      let gaveStamps = false;

      // Se não tinha cliente mas quer criar agora
      if (!finalCustomerId && createProfile) {
        if (!profileData.nome) {
          alert("Por favor insira pelo menos o nome do cliente.");
          return;
        }
        const newCustomer = await dataService.createCustomer({
          nome: profileData.nome,
          telemovel: deliveryWash.telemovel,
          nif: profileData.nif
        });
        
        // Associar o carro a este novo perfil
        await dataService.addVehicle({
          cliente_id: newCustomer.id,
          matricula: deliveryWash.matricula,
          marca: '',
          modelo: ''
        });

        finalCustomerId = newCustomer.id;
        gaveStamps = true;
      } else if (finalCustomerId) {
        // Já tinha cliente detetado desde o início
        gaveStamps = true;
      }

      const { justEarnedFreeWash, newStamps } = await dataService.completeWashAndAssign(deliveryWash.id, finalCustomerId, gaveStamps, false);
      
      setDeliveryWash(null);
      loadDashboardData();
      
      // WhatsApp Messages
      if (createProfile && finalCustomerId) {
        const c = await dataService.getCustomerById(finalCustomerId);
        whatsappService.openWhatsApp(c.telemovel, [
          `Olá ${c.nome.split(' ')[0]}! 🎉 Bem-vindo(a) ao nosso cartão de fidelização.`,
          `Ganhou 1 carimbo com a lavagem de hoje!`,
          '',
          `Aceda ao seu cartão digital aqui: ${window.location.hostname === 'localhost' ? 'https://garagemmlavagens.vercel.app' : window.location.origin}/cartao?id=${c.id}`,
          '',
          `Obrigado pela preferência! 💧`
        ].join('\n'));
      } else if (finalCustomerId && gaveStamps) {
        if (justEarnedFreeWash) {
          whatsappService.openWhatsApp(deliveryWash.telemovel, [
            `PARABÉNS 🎉!`,
            `Com a lavagem de hoje, acabou de completar o seu cartão de fidelização!`,
            '',
            `A sua próxima lavagem é totalmente GRÁTIS! 🎁`,
            `Obrigado pela preferência e até à próxima! 💧`
          ].join('\n'));
        } else {
          whatsappService.openWhatsApp(deliveryWash.telemovel, [
            `Obrigado pela visita! 💧`,
            `Acabou de ganhar +1 carimbo. (Total: ${newStamps}/10)`,
            `Faltam ${10 - newStamps} para a sua lavagem grátis!`,
            '',
            `Pode ver o seu cartão aqui: ${window.location.hostname === 'localhost' ? 'https://garagemmlavagens.vercel.app' : window.location.origin}/cartao?id=${finalCustomerId}`
          ].join('\n'));
        }
      }
    } catch (error) {
      console.error("Erro na entrega:", error);
      alert("Erro ao entregar a viatura.");
    }
  };

  const handleRedeemFreeWash = async (e) => {
    e.preventDefault();
    if (!deliveryWash || !deliveryCustomer) return;
    
    try {
      await dataService.completeWashAndAssign(deliveryWash.id, deliveryCustomer.id, false, true);
      
      setDeliveryWash(null);
      setDeliveryCustomer(null);
      loadDashboardData();
      
      // WhatsApp message for free wash
      whatsappService.openWhatsApp(deliveryCustomer.telemovel, [
        `Olá ${deliveryCustomer.nome.split(' ')[0]}!`,
        `Acabou de usar a sua 🎁 Lavagem Grátis! Esperamos que o seu carro fique impecável.`,
        '',
        `Obrigado pela preferência e até à próxima! 💧`
      ].join('\n'));
    } catch (error) {
      console.error("Erro ao descontar oferta:", error);
      alert("Erro ao descontar oferta.");
    }
  };

  return (
    <div className="dashboard min-h-screen bg-gray-50 pb-12">
      <div style={{ padding: '0 0 1.5rem 0', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', marginRight: '0.75rem' }}>M</div>
          Painel de Funcionário
          
          {botStatus.online ? (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#16a34a', background: '#dcfce7', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 'bold' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }}></div>
              Bot Online
            </div>
          ) : (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#dc2626', background: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 'bold' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></div>
              Bot Offline
            </div>
          )}
        </h1>
      </div>
      
      {!botStatus.online && (
        <div className="max-w-7xl mx-auto" style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '0.5rem', padding: '1rem', color: '#991b1b' }}>
            <h3 style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              ⚠️ O Robô do WhatsApp está desligado!
            </h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              As mensagens automáticas não estão a ser enviadas porque o terminal fechou ou o computador da garagem reiniciou.
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Para voltar a ligar, vá ao computador da garagem, abra o terminal e escreva:
            </p>
            <code style={{ background: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginTop: '0.5rem', display: 'inline-block', fontSize: '0.9rem' }}>
              cd Desktop/whatsapp-bot && npm start
            </code>
          </div>
        </div>
      )}

      {/* Tabs / Menu Superior */}
      <div className="max-w-7xl mx-auto" style={{ padding: '0 1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('producao')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '0.5rem',
              background: activeTab === 'producao' ? '#3b82f6' : 'transparent',
              color: activeTab === 'producao' ? 'white' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Car size={20} />
            Linha de Produção
          </button>
          <button 
            onClick={() => setActiveTab('clientes')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '0.5rem',
              background: activeTab === 'clientes' ? '#3b82f6' : 'transparent',
              color: activeTab === 'clientes' ? 'white' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <User size={20} />
            Fichas & Clientes
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 0 1rem;
        }
        @media (min-width: 1024px) {
          .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            align-items: start;
            padding: 0 1.5rem;
          }
        }
      `}} />

      <main className="max-w-7xl mx-auto dashboard-grid">
        
        {activeTab === 'producao' && (
          <>
            {/* Coluna Esquerda: Receção / Dar Entrada */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1rem', zIndex: 10 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PlusCircle color="#3b82f6" /> Dar Entrada de Viatura
                </h2>
                
                <form onSubmit={handleEntrySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="AA-00-AA"
                      value={entry.matricula}
                      onChange={e => setEntry({...entry, matricula: e.target.value.toUpperCase()})}
                      required
                      style={{ textTransform: 'uppercase', fontSize: '1.25rem', letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telemóvel do Cliente *</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="tel" 
                        className="input" 
                        placeholder="912345678"
                        value={entry.telemovel}
                        onChange={e => setEntry({...entry, telemovel: e.target.value})}
                        required
                        style={{ paddingLeft: '2.5rem', fontSize: '1.1rem' }}
                      />
                    </div>
                    {detectedCustomer && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: detectedCustomer.lavagens_gratuitas > 0 ? '#fef08a' : '#dcfce7', color: detectedCustomer.lavagens_gratuitas > 0 ? '#854d0e' : '#166534', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle size={16} /> Cliente Reconhecido: <b>{detectedCustomer.nome.split(' ')[0]}</b> 
                          {detectedCustomer.lavagens_gratuitas > 0 ? (
                            <span style={{fontWeight: 'bold', marginLeft: '0.5rem'}}>🎁 1 Oferta!</span>
                          ) : (
                            <span style={{marginLeft: '0.5rem'}}>({detectedCustomer.carimbos_acumulados}/10)</span>
                          )}
                        </div>
                        {detectedCustomer.vehicles && detectedCustomer.vehicles.length > 0 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const vehicle = detectedCustomer.vehicles.find(v => v.matricula.toUpperCase() === entry.matricula.toUpperCase()) || detectedCustomer.vehicles[0];
                              setEntry(prev => ({
                                ...prev,
                                telemovel: prev.telemovel || detectedCustomer.telemovel,
                                matricula: prev.matricula || vehicle.matricula,
                                marca_modelo: `${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim(),
                                cor: vehicle.cor || ''
                              }));
                            }}
                            style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Car size={14} /> Preencher Dados
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                      <select 
                        className="input" 
                        value={entry.tipo_servico}
                        onChange={e => setEntry({...entry, tipo_servico: e.target.value})}
                        style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                      >
                        <option value="Lavagem Exterior">Lavagem Exterior</option>
                        <option value="Lavagem Interior">Lavagem Interior</option>
                        <option value="Lavagem Completa">Lavagem Completa</option>
                        <option value="Serviço Especial">Serviço Especial</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marca / Modelo <span style={{color:'#94a3b8', fontSize:'0.75rem'}}>(Opcional)</span></label>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="Ex: BMW Série 1"
                        value={entry.marca_modelo}
                        onChange={e => setEntry({...entry, marca_modelo: e.target.value})}
                        style={{ fontSize: '1rem', padding: '0.75rem' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor <span style={{color:'#94a3b8', fontSize:'0.75rem'}}>(Opcional)</span></label>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="Ex: Branco"
                        value={entry.cor}
                        onChange={e => setEntry({...entry, cor: e.target.value})}
                        style={{ fontSize: '1rem', padding: '0.75rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Pedida *</label>
                    <input 
                      type="time" 
                      className="input" 
                      required
                      value={entry.hora_pedida}
                      onChange={e => setEntry({...entry, hora_pedida: e.target.value})}
                      style={{ fontSize: '1.25rem', padding: '0.75rem', fontWeight: 'bold' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmittingEntry}
                    style={{ padding: '1.25rem', fontSize: '1.25rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                  >
                    <Play size={20} />
                    Arrancar Lavagem
                  </button>
                </form>
              </div>
            </div>

            {/* Coluna Direita: Viaturas Ativas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Car color="#0f172a" /> Viaturas nas Instalações
              </h2>

              {activeWashes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem', color: '#64748b' }}>
                  Nenhuma viatura no posto de momento.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeWashes.map(wash => {
                    const isReady = wash.estado === 'finalizado';
                    return (
                      <div key={wash.id} className="card" style={{ 
                        padding: '1.25rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderLeft: isReady ? '6px solid #22c55e' : '6px solid #3b82f6',
                        background: isReady ? '#f0fdf4' : 'white'
                      }}>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                            {(wash.matricula || 'S/ Matricula').toUpperCase()}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                            <span>{wash.tipo_lavagem}</span>
                            {wash.marca_modelo && <span>{wash.marca_modelo} {wash.cor && `(${wash.cor})`}</span>}
                            {wash.hora_pedida && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🕒 {wash.hora_pedida}</span>}
                          </div>
                          {wash.cliente_id && (
                            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', marginTop: '0.25rem' }}>
                              ✓ Cliente Fidelizado
                            </div>
                          )}
                        </div>

                        <div>
                          {!isReady ? (
                            <button 
                              className="btn btn-outline"
                              style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                              onClick={() => setReadyWash(wash)}
                            >
                              <Check size={18} style={{ marginRight: '0.5rem' }} /> Marcar Pronto
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                              <button 
                                className="btn btn-outline"
                                style={{ borderColor: '#22c55e', color: '#22c55e', padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                onClick={() => {
                                  const msg = whatsappService.generateCarReadyMessage({ nome: 'Cliente' }, { matricula: wash.matricula, marca: '', modelo: '' });
                                  whatsappService.openWhatsApp(wash.telemovel, msg);
                                }}
                              >
                                <Phone size={16} style={{ marginRight: '0.5rem' }} /> Avisar Cliente
                              </button>
                              <button 
                                className="btn btn-primary"
                                style={{ background: '#22c55e', borderColor: '#22c55e', padding: '0.5rem 1rem' }}
                                onClick={() => handleOpenDelivery(wash)}
                              >
                                Entregar Viatura
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'clientes' && (
          <div style={{ gridColumn: '1 / -1' }}>
            {/* Pesquisa de Clientes (Wide) */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Gestão e Pesquisa de Clientes</h2>
                <button 
                  className="btn btn-primary flex-center"
                  onClick={() => handleCreateNewCustomer('')}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  <PlusCircle size={20} style={{ marginRight: '0.5rem' }} /> 
                  Criar Nova Ficha
                </button>
              </div>
              
              <QuickSearch 
                onSelectCustomer={handleSelectCustomer} 
                onCreateNew={handleCreateNewCustomer} 
              />

              {selectedCustomer && (
                <div className="mt-6 animate-fade-in" style={{ marginTop: '2rem' }}>
                  <CustomerCard 
                    customer={selectedCustomer}
                    onAddVehicle={() => setIsAddVehicleOpen(true)}
                    onEditVehicle={() => {}} 
                    onRemoveVehicle={async (id) => {
                      if (window.confirm('Tem a certeza que deseja remover esta viatura?')) {
                        await dataService.removeVehicle(id);
                        handleSelectCustomer(selectedCustomer);
                      }
                    }}
                    onStartWash={() => {
                      // Opcional: preencher o formulário lá em cima com os dados deste cliente
                      setEntry({
                        ...entry,
                        telemovel: selectedCustomer.telemovel,
                        matricula: selectedCustomer.vehicles?.[0]?.matricula || ''
                      });
                      setActiveTab('producao');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Modal de Entrega */}
      {deliveryWash && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Entregar Viatura</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Matrícula: <b>{deliveryWash.matricula.toUpperCase()}</b></p>
            
            <form onSubmit={handleConfirmDelivery}>
              {!deliveryWash.cliente_id && (
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    <input 
                      type="checkbox" 
                      checked={createProfile}
                      onChange={e => setCreateProfile(e.target.checked)}
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    O cliente deseja aderir ao Cartão Digital?
                  </label>
                  
                  {createProfile && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#64748b' }}>O telemóvel <b>{deliveryWash.telemovel}</b> será usado como login. (1 Carimbo Grátis ganho hoje!)</p>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Nome do Cliente *</label>
                        <input type="text" className="input" required value={profileData.nome} onChange={e => setProfileData({...profileData, nome: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">NIF (Opcional)</label>
                        <input type="text" className="input" value={profileData.nif} onChange={e => setProfileData({...profileData, nif: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {deliveryWash.cliente_id && deliveryCustomer && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: deliveryCustomer.lavagens_gratuitas > 0 ? '#fef08a' : '#f8fafc', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: deliveryCustomer.lavagens_gratuitas > 0 ? '#854d0e' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={20} /> Cliente Fidelizado!
                  </h3>
                  {deliveryCustomer.lavagens_gratuitas > 0 ? (
                    <p style={{ marginTop: '0.5rem', color: '#854d0e', fontWeight: 'bold' }}>🎁 O cliente tem 1 Lavagem Grátis disponível!</p>
                  ) : (
                    <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Mais um carimbo ganho hoje. ({deliveryCustomer.carimbos_acumulados}/10)</p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setDeliveryWash(null); setDeliveryCustomer(null); }} className="btn btn-secondary">Cancelar</button>
                {deliveryWash.cliente_id && deliveryCustomer && deliveryCustomer.lavagens_gratuitas > 0 ? (
                  <button type="button" onClick={handleRedeemFreeWash} style={{ background: '#eab308', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    🎁 Descontar Oferta
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary">Confirmar Entrega</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outros Modais (Gestão de Clientes) */}
      {isNewCustomerOpen && (
        <NewCustomerModal
          initialPhone={searchQuery}
          onClose={() => setIsNewCustomerOpen(false)}
          onSuccess={(newCustomer) => {
            setIsNewCustomerOpen(false);
            handleSelectCustomer(newCustomer);
            loadDashboardData();
          }}
        />
      )}

      {isAddVehicleOpen && selectedCustomer && (
        <AddVehicleModal
          customerId={selectedCustomer.id}
          onClose={() => setIsAddVehicleOpen(false)}
          onSuccess={() => {
            setIsAddVehicleOpen(false);
            handleSelectCustomer(selectedCustomer);
          }}
        />
      )}
      {/* Modal: Confirmar Pronto (com WhatsApp) */}
      {readyWash && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card animate-scale-up" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Viatura Pronta</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Deseja enviar uma mensagem automática via WhatsApp para avisar o cliente?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  await dataService.updateWashStatus(readyWash.id, 'finalizado');
                  loadDashboardData();
                  const msg = whatsappService.generateCarReadyMessage({ nome: 'Cliente' }, { matricula: readyWash.matricula, marca: '', modelo: '' });
                  whatsappService.openWhatsApp(readyWash.telemovel, msg);
                  setReadyWash(null);
                }}
              >
                Sim, Marcar Pronto & Avisar
              </button>
              <button 
                className="btn btn-outline"
                onClick={async () => {
                  await dataService.updateWashStatus(readyWash.id, 'finalizado');
                  loadDashboardData();
                  setReadyWash(null);
                }}
              >
                Não, Apenas Marcar Pronto
              </button>
            </div>
            <button 
              style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => setReadyWash(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}