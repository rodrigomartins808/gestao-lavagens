import React, { useState, useEffect } from 'react';
import { LogOut, BarChart2, Users, MessageSquare, Download, AlertTriangle, Search, Trash2, Calendar, FileText, X, Car, Award, Cloud, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import dataService from '../services/dataService';
import { supabase } from '../lib/supabase';
import whatsappService from '../services/whatsappService';
import { migrateToSupabase } from '../services/migrationService';

export default function AdminDashboard({ currentUser }) {
  const [activeTab, setActiveTab] = useState('painel');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [stats, setStats] = useState({ today: null, month: null, global: null });
  const [customers, setCustomers] = useState([]);
  const [inactiveCustomers, setInactiveCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for Global History Tab
  const [globalHistory, setGlobalHistory] = useState([]);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('');

  const [campaignText, setCampaignText] = useState('Olá! Temos saudades suas. Visite-nos esta semana e ganhe 20% de desconto na sua próxima lavagem!');
  const [campaignType, setCampaignType] = useState('almost_there');
  
  // Fuel Prices & Bookings State
  const [fuelPrices, setFuelPrices] = useState({ gasoleo: '1.49', gasolina: '1.69', gas: '0.89' });
  const [bookings, setBookings] = useState([]);
  
  // New State for Analytics
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  
  // Modal State for Customer Details
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState(null);
  const [customerWashes, setCustomerWashes] = useState([]);

  // New CRM Data
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ nome: '', telemovel: '', nif: '' });
  const [selectedCustomerForVehicle, setSelectedCustomerForVehicle] = useState(null);
  const [newVehicleData, setNewVehicleData] = useState({ matricula: '', marca: '', modelo: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    loadData();

    // Subscribe to new bookings to play a sound
    const bookingsSubscription = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, payload => {
        // Play notification sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.error("Audio play failed:", e));
        
        // Reload data to get the new booking in the list
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, []);

  const loadData = async () => {
    try {
      const today = await dataService.getTodayStats();
      const month = await dataService.getMonthStats();
      const _globalStats = await dataService.getGlobalStats();
      const allCustomers = await dataService.getAllCustomers();
      const inactive = await dataService.getInactiveCustomers(30);
      const _history = await dataService.getAllWashesHistory();
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const daily = await dataService.getWashesPerDay(currentMonth, currentYear);
      const monthly = await dataService.getWashesPerMonth(currentYear);
      const prices = await dataService.getFuelPrices();
      const bks = await dataService.getBookings();
      
      // Calculate lifetime value and daysInactive for customers in list
      const processedCustomers = (allCustomers || []).map(c => {
        let daysInactive = 0;
        if (c.last_wash_date) {
           const ms = new Date() - new Date(c.last_wash_date);
           daysInactive = Math.floor(ms / (1000 * 60 * 60 * 24));
        }
        
        const cWashes = (_history || []).filter(w => w.cliente_id === c.id);
        const ltv = cWashes.reduce((sum, w) => sum + (Number(w.valor) || 0), 0);
        
        return {
          ...c,
          daysInactive,
          ltv,
          total_lavagens_historico: cWashes.length
        };
      });
      processedCustomers.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));

      setStats({ today, month, global: _globalStats });
      setCustomers(processedCustomers);
      setInactiveCustomers(inactive || []);
      setGlobalHistory(_history || []);
      setDailyData(daily);
      setMonthlyData(monthly);
      setFuelPrices(prices);
      setBookings(bks);
    } catch (error) {
      console.error("Erro ao carregar dados do admin:", error);
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o cliente ${name}? Esta ação é irreversível.`)) {
      await dataService.deleteCustomer(id);
      loadData();
    }
  };

  const autoFitColumns = (json, ws) => {
    if (!json || json.length === 0) return;
    
    // Auto fit columns
    const keys = Object.keys(json[0]);
    const colWidths = keys.map(key => {
      let maxLen = key.length;
      json.forEach(row => {
        const val = row[key];
        if (val !== null && val !== undefined) {
          const len = String(val).length;
          if (len > maxLen) maxLen = len;
        }
      });
      return { wch: maxLen + 4 };
    });
    ws['!cols'] = colWidths;
  };

  const handleExportData = async () => {
    try {
      const data = await dataService.getExportData();
      const wb = XLSX.utils.book_new();
      
      const formattedCustomers = data.customers.map(c => ({
        'Nº Cliente': c.numero_cliente,
        'Nome': c.nome,
        'Telemóvel': c.telemovel,
        'NIF': c.nif || '',
        'Carimbos (Atuais)': c.carimbos_acumulados,
        'Lavagens Gratuitas': c.lavagens_gratuitas || 0
      }));
      const wsCustomers = XLSX.utils.json_to_sheet(formattedCustomers);
      autoFitColumns(formattedCustomers, wsCustomers);
      XLSX.utils.book_append_sheet(wb, wsCustomers, "Clientes");
      
      const formattedVehicles = data.vehicles.map(v => ({
        'ID Viatura': v.id,
        'Matrícula': v.matricula,
        'Marca': v.marca,
        'Modelo': v.modelo,
        'Cor': v.cor,
        'ID Cliente': v.cliente_id
      }));
      const wsVehicles = XLSX.utils.json_to_sheet(formattedVehicles);
      autoFitColumns(formattedVehicles, wsVehicles);
      XLSX.utils.book_append_sheet(wb, wsVehicles, "Viaturas");
      
      const formattedWashes = data.washes.map(w => {
        const customer = w.cliente_id ? data.customers.find(c => c.id === w.cliente_id) : null;
        return {
          'Data': new Date(w.data).toLocaleString('pt-PT'),
          'Serviço': w.tipo_lavagem,
          'Valor (€)': w.valor,
          'Cliente': customer ? customer.nome : 'Anónimo',
          'NIF': customer?.nif || '',
          'Carimbo': w.carimbos_ganhos > 0 ? 'Sim' : 'Não'
        };
      });
      const wsWashes = XLSX.utils.json_to_sheet(formattedWashes);
      autoFitColumns(formattedWashes, wsWashes);
      XLSX.utils.book_append_sheet(wb, wsWashes, "Lavagens");
      
      XLSX.writeFile(wb, `posto_gestao_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      showToast("Ocorreu um erro ao exportar os dados.", "error");
    }
  };

  const handleExportMonthlyBilling = async () => {
    const data = await dataService.getExportData();
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthWashes = data.washes.filter(w => w.data.startsWith(currentMonth) && w.valor > 0);
    
    if (monthWashes.length === 0) {
      showToast("Não existem lavagens faturadas neste mês.", "error");
      return;
    }
    
    const exportData = monthWashes.map(w => {
      const customer = w.cliente_id ? data.customers.find(c => c.id === w.cliente_id) : null;
      return {
        'Data/Hora': new Date(w.data).toLocaleString('pt-PT'),
        'Tipo de Serviço': w.tipo_lavagem,
        'Valor (€)': w.valor,
        'Nome do Cliente': customer ? customer.nome : 'Anónimo',
        'NIF': customer?.nif || 'Consumidor Final',
      };
    });

    const totalRevenue = monthWashes.reduce((sum, w) => sum + (Number(w.valor) || 0), 0);
    exportData.push({
      'Data/Hora': '',
      'Tipo de Serviço': 'TOTAL DO MÊS',
      'Valor (€)': totalRevenue,
      'Nome do Cliente': '',
      'NIF': ''
    });
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    autoFitColumns(exportData, ws);
    XLSX.utils.book_append_sheet(wb, ws, "Faturação Mês");
    XLSX.writeFile(wb, `faturacao_${currentMonth}.xlsx`);
  };

  const handleExportInactive = () => {
    if (inactiveCustomers.length === 0) {
      showToast("Não existem clientes inativos.", "error");
      return;
    }
    const exportData = inactiveCustomers.map(c => ({
      'Nome': c.nome,
      'Telemóvel': c.telemovel,
      'Última Lavagem': c.lastWashDate ? new Date(c.lastWashDate).toLocaleDateString('pt-PT') : 'Desconhecida',
      'Dias Inativo': c.daysInactive,
      'Carimbos Atuais': c.carimbos_acumulados,
      'Lavagens Gratuitas': c.lavagens_gratuitas || 0
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    autoFitColumns(exportData, ws);
    XLSX.utils.book_append_sheet(wb, ws, "Clientes Inativos");
    XLSX.writeFile(wb, `clientes_inativos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportTopCustomers = () => {
    const top = [...customers].sort((a, b) => (b.carimbos_acumulados || 0) - (a.carimbos_acumulados || 0)).slice(0, 20);
    if (top.length === 0) {
      showToast("Sem clientes registados.", "error");
      return;
    }
    const exportData = top.map(c => ({
      'Nome': c.nome,
      'Telemóvel': c.telemovel,
      'Nº Cliente': c.numero_cliente,
      'Carimbos Atuais': c.carimbos_acumulados,
      'Total Gasto': (c.totalGasto || 0).toFixed(2) + ' €',
      'Lavagens Gratuitas': c.lavagens_gratuitas || 0
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    autoFitColumns(exportData, ws);
    XLSX.utils.book_append_sheet(wb, ws, "Top Clientes");
    XLSX.writeFile(wb, `top_clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSendCampaign = (customer) => {
    if (customer && customer.telemovel) {
      let msg = '';
      if (campaignType === 'almost_there') {
        msg = whatsappService.generateAlmostThereMessage(customer);
      } else if (campaignType === 'miss_car') {
        const vehicle = (customer.viaturas && customer.viaturas.length > 0) ? customer.viaturas[0] : null;
        msg = whatsappService.generateMissYourCarMessage(customer, vehicle);
      } else if (campaignType === 'vip_reactivation') {
        msg = whatsappService.generateVIPReactivationMessage(customer);
      } else {
        msg = whatsappService.generateCampaignMessage(customer, campaignText);
      }
      whatsappService.openWhatsApp(customer.telemovel, msg);
    }
  };
  
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerData.nome || !newCustomerData.telemovel) {
      showToast("Nome e telemóvel são obrigatórios.", "error");
      return;
    }
    try {
      await dataService.createCustomer(newCustomerData);
      setIsNewCustomerModalOpen(false);
      setNewCustomerData({ nome: '', telemovel: '', nif: '' });
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar cliente.", "error");
    }
  };

  const handleAddVehicleAdmin = async (e) => {
    e.preventDefault();
    if (!newVehicleData.matricula) {
      showToast("Matrícula é obrigatória.", "error");
      return;
    }
    try {
      await dataService.addVehicle({
        cliente_id: selectedCustomerForVehicle.id,
        ...newVehicleData
      });
      setSelectedCustomerForVehicle(null);
      setNewVehicleData({ matricula: '', marca: '', modelo: '' });
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Erro ao adicionar viatura.", "error");
    }
  };

  const handleRemoveVehicle = async (vehicleId, matricula) => {
    if (!window.confirm(`Tem a certeza que deseja remover a viatura ${matricula} da ficha deste cliente?`)) {
      return;
    }
    try {
      await dataService.removeVehicle(vehicleId);
      // Atualizar a lista de viaturas no modal sem o fechar
      const updatedVehicles = selectedCustomerForDetails.viaturas.filter(v => v.id !== vehicleId);
      setSelectedCustomerForDetails({ ...selectedCustomerForDetails, viaturas: updatedVehicles });
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Erro ao remover viatura.", "error");
    }
  };

  const handleOpenCustomerDetails = async (customer) => {
    const washes = await dataService.getWashesByCustomer(customer.id);
    const vehicles = await dataService.getVehiclesByCustomer(customer.id);
    setCustomerWashes(washes);
    setSelectedCustomerForDetails({ ...customer, viaturas: vehicles });
  };

  const handleDescontarVale = async () => {
    if (!selectedCustomerForDetails) return;
    const currentVales = selectedCustomerForDetails.vales_descontados || 0;
    try {
      const updated = await dataService.updateCustomer(selectedCustomerForDetails.id, {
        vales_descontados: currentVales + 1
      });
      setSelectedCustomerForDetails({ ...selectedCustomerForDetails, vales_descontados: currentVales + 1 });
      
      // Update in the main list too
      const updatedCustomers = customers.map(c => c.id === updated.id ? { ...c, vales_descontados: currentVales + 1 } : c);
      setCustomers(updatedCustomers);
      showToast('Vale descontado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao descontar vale.', 'error');
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.nome && c.nome.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.telemovel && c.telemovel.includes(searchQuery)) ||
    (c.numero_cliente && c.numero_cliente.includes(searchQuery)) ||
    (c.nif && c.nif.includes(searchQuery))
  );

  const handleSaveFuelPrices = async () => {
    try {
      await dataService.updateFuelPrices(fuelPrices);
      showToast('Preços atualizados com sucesso! A Landing Page já está a mostrar os novos preços.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar preços.', 'error');
    }
  };

  const handleBookingAction = async (id, newStatus) => {
    try {
      await dataService.updateBookingStatus(id, newStatus);
      const updatedBookings = bookings.map(b => b.id === id ? { ...b, estado: newStatus } : b);
      setBookings(updatedBookings);
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar estado da marcação.', 'error');
    }
  };

  const handleConvertBookingToCustomer = (booking) => {
    setNewCustomerData({
      nome: booking.nome,
      telemovel: booking.telemovel,
      nif: ''
    });
    setNewVehicleData({
      matricula: booking.matricula || '',
      marca: '',
      modelo: ''
    });
    setIsNewCustomerModalOpen(true);
    // Optional: could mark the booking as accepted and converted automatically
  };

  return (
    <div className="dashboard min-h-screen" style={{ display: 'flex' }}>
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.type === 'error' ? <AlertTriangle size={20} /> : <Award size={20} />}
          {toast.message}
        </div>
      )}

      {/* Sidebar - Vanilla CSS fixing broken layout */}
      <aside style={{ width: '250px', background: 'var(--bg-panel)', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: 'var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '1rem' }}>
            PG
          </div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Admin</h1>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'painel' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'painel' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
            onClick={() => setActiveTab('painel')}
            onMouseEnter={e => { if(activeTab !== 'painel') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if(activeTab !== 'painel') e.currentTarget.style.background = 'transparent' }}
          >
            <BarChart2 size={18} style={{ marginRight: '0.75rem' }} /> Painel Central
          </button>
          <button 
            style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'clientes' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'clientes' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
            onClick={() => setActiveTab('clientes')}
            onMouseEnter={e => { if(activeTab !== 'clientes') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if(activeTab !== 'clientes') e.currentTarget.style.background = 'transparent' }}
          >
            <Users size={18} style={{ marginRight: '0.75rem' }} /> Clientes
          </button>
          <button 
            style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'campanhas' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'campanhas' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
            onClick={() => setActiveTab('campanhas')}
            onMouseEnter={e => { if(activeTab !== 'campanhas') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if(activeTab !== 'campanhas') e.currentTarget.style.background = 'transparent' }}
          >
            <MessageSquare size={18} style={{ marginRight: '0.75rem' }} /> Campanhas
          </button>
          <button 
            className="menu-btn"
            onClick={() => setActiveTab('historico')}
            style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'historico' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'historico' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
            onMouseEnter={e => { if(activeTab !== 'historico') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if(activeTab !== 'historico') e.currentTarget.style.background = 'transparent' }}
          >
            <Calendar size={20} style={{ marginRight: '0.75rem' }} /> Histórico Geral
          </button>
          <button 
            className="menu-btn"
            onClick={() => setActiveTab('exportacoes')}
            style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'exportacoes' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'exportacoes' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
            onMouseEnter={e => { if(activeTab !== 'exportacoes') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if(activeTab !== 'exportacoes') e.currentTarget.style.background = 'transparent' }}
          >
            <Download size={20} style={{ marginRight: '0.75rem' }} /> Exportações
          </button>
          <button 
            className="menu-btn"
            onClick={() => setActiveTab('marcacoes')}
            style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'marcacoes' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'marcacoes' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
            onMouseEnter={e => { if(activeTab !== 'marcacoes') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if(activeTab !== 'marcacoes') e.currentTarget.style.background = 'transparent' }}
          >
            <Calendar size={20} style={{ marginRight: '0.75rem' }} /> Marcações
          </button>
          <button 
            className="menu-btn"
            onClick={() => setActiveTab('precos')}
            style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'precos' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'precos' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
            onMouseEnter={e => { if(activeTab !== 'precos') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={e => { if(activeTab !== 'precos') e.currentTarget.style.background = 'transparent' }}
          >
            <FileText size={20} style={{ marginRight: '0.75rem' }} /> Preços
          </button>
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: 'var(--glass-border)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Sessão: <span style={{ color: 'var(--text-primary)' }}>{currentUser?.name || 'Administrador'}</span>
          </div>
          <button className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => window.location.reload()}>
            <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Terminar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', height: '100vh' }}>
        {activeTab === 'painel' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Visão Geral</h2>
            </div>
            
            {/* Global Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-primary)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Lavagens (Hoje)</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.today?.totalWashes || 0}</p>
              </div>
              <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-green)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Faturação (Hoje)</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(stats.today?.totalRevenue || 0).toFixed(2)}€</p>
              </div>
              <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-amber)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Novos Clientes (Mês)</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.month?.newCustomers || 0}</p>
              </div>
              <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-cyan)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Faturação (Mês)</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(stats.month?.totalRevenue || 0).toFixed(2)}€</p>
              </div>
            </div>

            {/* Detailed Tables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Daily Table */}
              <div className="card" style={{ padding: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                  <Calendar size={18} style={{ marginRight: '0.5rem', color: 'var(--accent-primary)' }} /> 
                  Lavagens por Dia (Mês Atual)
                </h3>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Dia</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Qtd. Lavagens</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Faturação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.filter(d => d.count > 0).length > 0 ? (
                      dailyData.filter(d => d.count > 0).map(d => (
                        <tr key={`day-${d.day}`} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{String(d.day).padStart(2, '0')}/{String(new Date().getMonth() + 1).padStart(2, '0')}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
                              {d.count}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>{d.revenue.toFixed(2)}€</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sem registos este mês.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Monthly Table */}
              <div className="card" style={{ padding: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                  <BarChart2 size={18} style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }} /> 
                  Lavagens por Mês (Ano Atual)
                </h3>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Mês</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Qtd. Lavagens</th>
                      <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Faturação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.filter(m => m.count > 0).length > 0 ? (
                      monthlyData.filter(m => m.count > 0).map(m => (
                        <tr key={`month-${m.month}`} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{m.month}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
                              {m.count}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>{m.revenue.toFixed(2)}€</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sem registos este ano.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lifetime metrics */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Métricas Globais (Todo o Tempo)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total de Lavagens Registadas</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.global?.totalWashes || 0}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Lavagens Anónimas (Sem Ficha)</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.global?.totalAnonymousWashes || 0}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Lavagens Gratuitas Ofertas</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.global?.totalFreeWashes || 0}</p>
                </div>
              </div>
            </div>
            
            {inactiveCustomers.length > 0 && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--accent-amber)', padding: '1.5rem', borderRadius: '8px', display: 'flex' }}>
                <AlertTriangle style={{ color: 'var(--accent-amber)', marginRight: '1rem' }} size={24} />
                <div>
                  <h3 style={{ fontWeight: 'bold', color: '#d97706', marginBottom: '0.5rem' }}>Atenção Necessária</h3>
                  <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Existem {inactiveCustomers.length} clientes inativos há mais de 45 dias.</p>
                  <button 
                    style={{ background: 'none', border: 'none', color: '#d97706', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    onClick={() => setActiveTab('campanhas')}
                  >
                    Ir para Campanhas de Reativação
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Gestão de Clientes</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar clientes (Nome, NIF, Tel)..." 
                    className="input"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => setIsNewCustomerModalOpen(true)}
                >
                  <Plus size={18} /> Novo Cliente
                </button>
              </div>
            </div>
            
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(0,0,0,0.03)' }}>
                    <tr>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Cliente</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>NIF / Contacto</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Data Registo</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Carimbos</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Total Lavagens</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Faturação Total</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{c.nome}</div>
                          <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.25rem' }}>{c.numero_cliente}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div>{c.telemovel || 'Sem Tel'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{c.nif ? `NIF: ${c.nif}` : 'S/ NIF'}</div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                          {new Date(c.criado_em).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '60px', background: 'rgba(0,0,0,0.08)', height: '6px', borderRadius: '3px', marginRight: '8px', overflow: 'hidden' }}>
                              <div style={{ background: 'var(--accent-primary)', height: '100%', width: `${(c.carimbos_acumulados / 10) * 100}%` }}></div>
                            </div>
                            <span style={{ fontSize: '0.875rem' }}>{c.carimbos_acumulados}/10</span>
                          </div>
                          {c.lavagens_gratuitas > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#059669', textAlign: 'center', marginTop: '0.25rem' }}>
                              +{c.lavagens_gratuitas} Ofertas
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                          {c.total_lavagens_historico || 0}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>
                          {(c.ltv || 0).toFixed(2)}€
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                              title="Ver Detalhes do Cliente"
                              onClick={() => handleOpenCustomerDetails(c)}
                              onMouseEnter={e => e.currentTarget.style.color = 'white'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                              <FileText size={18} />
                            </button>
                            <button 
                              style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                              title="Adicionar Viatura"
                              onClick={() => setSelectedCustomerForVehicle(c)}
                            >
                              <Plus size={16} /><Car size={18} style={{ marginLeft: '2px' }} />
                            </button>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '4px' }}
                              title="Eliminar Cliente"
                              onClick={() => handleDeleteCustomer(c.id, c.nome)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Nenhum cliente encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campanhas' && (() => {
          let targets = [];
          if (campaignType === 'almost_there') targets = customers.filter(c => (c.carimbos_acumulados || 0) === 9 && (c.daysInactive || 0) >= 30);
          else if (campaignType === 'miss_car') targets = customers.filter(c => (c.daysInactive || 0) >= 45 && c.viaturas && c.viaturas.length > 0);
          else if (campaignType === 'vip_reactivation') targets = customers.filter(c => (c.daysInactive || 0) >= 90);
          else targets = customers.slice(0, 50);

          const handleSendCampaignToAll = () => {
            if (targets.length === 0) return;
            if (!window.confirm(`Atenção: O sistema vai tentar abrir ${targets.length} abas do WhatsApp. O seu navegador pode bloquear pop-ups. Deseja continuar?`)) return;
            
            targets.forEach(c => {
              if (c && c.telemovel) {
                let msg = campaignText.replaceAll('{nome}', c.nome.split(' ')[0]);
                if (c.viaturas && c.viaturas.length > 0) {
                  msg = msg.replaceAll('{marca}', c.viaturas[0].marca || 'carro');
                } else {
                  msg = msg.replaceAll('{marca}', 'carro');
                }
                whatsappService.openWhatsApp(c.telemovel, msg);
              }
            });
          };

          return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Campanhas de Reativação</h2>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <button className={`btn ${campaignType === 'almost_there' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setCampaignType('almost_there'); setCampaignText('Olá {nome}! Notámos que só lhe falta 1 carimbo para ganhar uma lavagem grátis! 🎉 Venha visitar-nos esta semana para completar o seu cartão VIP.'); }}>🎯 Quase Lá! (Falta 1)</button>
              <button className={`btn ${campaignType === 'miss_car' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setCampaignType('miss_car'); setCampaignText('Olá {nome}! O seu {marca} já tem saudades de brilhar! ✨ Já passaram algumas semanas desde a sua última lavagem connosco. Que tal dar-lhe um mimo especial esta semana?'); }}>🚗 Saudades do Carro</button>
              <button className={`btn ${campaignType === 'vip_reactivation' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setCampaignType('vip_reactivation'); setCampaignText('Olá {nome}! Temos saudades suas! Preparamos uma oferta especial de 20% de desconto para o seu próximo serviço. Visite-nos nos próximos dias para aproveitar!'); }}>🎁 Reativação VIP</button>
              <button className={`btn ${campaignType === 'custom' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setCampaignType('custom'); setCampaignText('Olá {nome}! Temos saudades suas. Visite-nos esta semana e ganhe 20% de desconto na sua próxima lavagem!'); }}>✏️ Personalizada</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Configurar Mensagem</h3>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Texto a Enviar (WhatsApp)</label>
                  <textarea 
                    className="input"
                    style={{ width: '100%', minHeight: '120px', padding: '1rem', resize: 'vertical' }}
                    value={campaignText}
                    onChange={e => setCampaignText(e.target.value)}
                  ></textarea>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Use <b>{'{nome}'}</b> para o nome do cliente e <b>{'{marca}'}</b> para a marca do veículo.</p>
                </div>
              </div>
              
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Alvos Selecionados <span style={{ marginLeft: '0.5rem', background: 'var(--accent-primary)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.875rem' }}>{targets.length}</span></span>
                  {targets.length > 0 && (
                    <button 
                      onClick={handleSendCampaignToAll}
                      style={{ background: 'var(--accent-whatsapp)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <MessageSquare size={14} style={{ marginRight: '0.5rem' }} /> Enviar para Todos
                    </button>
                  )}
                </h3>
                
                <div style={{ overflowY: 'auto', flex: 1, maxHeight: '350px' }}>
                  {targets.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                      <p>Nenhum cliente cumpre os critérios desta campanha.</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>A sua retenção está excelente!</p>
                    </div>
                  ) : (
                    targets.map(c => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{c.nome}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{c.telemovel} • {c.daysInactive || 0} dias ausente</div>
                        </div>
                        <button 
                          className="btn" style={{ background: 'var(--accent-whatsapp)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', padding: '0.5rem 1rem' }}
                          onClick={() => {
                            let msg = campaignText.replaceAll('{nome}', c.nome.split(' ')[0]);
                            if (c.viaturas && c.viaturas.length > 0) {
                              msg = msg.replaceAll('{marca}', c.viaturas[0].marca || 'carro');
                            } else {
                              msg = msg.replaceAll('{marca}', 'carro');
                            }
                            whatsappService.openWhatsApp(c.telemovel, msg);
                          }}
                        >
                          <MessageSquare size={14} style={{ marginRight: '0.5rem' }} /> Enviar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {activeTab === 'historico' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Histórico Geral de Lavagens</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Consulte todos os registos de lavagem que deram entrada na garagem.</p>
              </div>
            </div>

            <div className="card" style={{ padding: '0' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text"
                    className="input"
                    placeholder="Pesquisar por matrícula ou telemóvel..."
                    value={historySearchQuery}
                    onChange={e => setHistorySearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.5rem', background: 'white' }}
                  />
                </div>
                <div style={{ position: 'relative', width: '200px' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="date"
                    className="input"
                    value={historyDateFilter}
                    onChange={e => setHistoryDateFilter(e.target.value)}
                    style={{ paddingLeft: '2.5rem', background: 'white' }}
                  />
                </div>
                {historyDateFilter && (
                  <button 
                    onClick={() => setHistoryDateFilter('')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}
                  >
                    Limpar Data
                  </button>
                )}
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Data e Hora</th>
                      <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Matrícula</th>
                      <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Telemóvel</th>
                      <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Serviço</th>
                      <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Estado</th>
                      <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Ficha Cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalHistory
                      .filter(w => {
                        const matchText = ((w.matricula || '').toLowerCase().includes(historySearchQuery.toLowerCase()) || 
                                           (w.telemovel || '').includes(historySearchQuery));
                        let matchDate = true;
                        if (historyDateFilter) {
                           matchDate = (w.data || '').startsWith(historyDateFilter);
                        }
                        return matchText && matchDate;
                      })
                      .map(w => (
                      <tr key={w.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>{new Date(w.data || new Date()).toLocaleString('pt-PT')}</td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{(w.matricula || '').toUpperCase()}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>{w.telemovel || ''}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>{w.tipo_servico || ''}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 'bold',
                            background: w.estado === 'entregue' ? '#dcfce7' : w.estado === 'finalizado' ? '#fef08a' : '#f1f5f9',
                            color: w.estado === 'entregue' ? '#166534' : w.estado === 'finalizado' ? '#854d0e' : '#475569'
                          }}>
                            {(w.estado || 'Desconhecido').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          {w.cliente_id ? (
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Sim</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Não</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {globalHistory.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Nenhum registo de lavagem encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exportacoes' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Relatórios & Exportações</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignSelf: 'flex-start' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Download size={18} style={{ marginRight: '0.5rem', color: 'var(--accent-primary)' }} /> Opções de Exportação (XLSX)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Exporte planilhas organizadas, prontas a imprimir ou enviar para o seu contabilista.</p>
                
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleExportData}>
                  <Download size={16} style={{ marginRight: '0.5rem' }} /> Exportar Base de Dados (Backup)
                </button>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleExportMonthlyBilling}>
                  <Download size={16} style={{ marginRight: '0.5rem' }} /> Exportar Faturação do Mês
                </button>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }} onClick={handleExportInactive}>
                  <Download size={16} style={{ marginRight: '0.5rem' }} /> Exportar Clientes Inativos (&gt; 45 dias)
                </button>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }} onClick={handleExportTopCustomers}>
                  <Download size={16} style={{ marginRight: '0.5rem' }} /> Exportar Top Clientes
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                    <AlertTriangle size={18} style={{ marginRight: '0.5rem', color: 'var(--accent-amber)' }} /> Clientes Inativos (Top 10)
                  </h3>
                  {inactiveCustomers.length > 0 ? (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nome</th>
                          <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Dias Ausente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inactiveCustomers.slice(0, 10).map(c => (
                          <tr key={`inac-${c.id}`} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                            <td style={{ padding: '0.5rem', fontWeight: '500' }}>{c.nome}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', color: '#d97706' }}>{c.daysInactive} dias</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Não há clientes inativos no momento.</p>
                  )}
                </div>

                <div className="card" style={{ padding: '1.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                    <Award size={18} style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }} /> Top Clientes (Fidelizados)
                  </h3>
                  {customers.filter(c => c.carimbos_acumulados > 0).length > 0 ? (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nome</th>
                          <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Ofertas</th>
                          <th style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Carimbos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...customers].sort((a,b) => (b.carimbos_acumulados || 0) - (a.carimbos_acumulados || 0)).slice(0, 10).map(c => (
                          <tr key={`top-${c.id}`} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                            <td style={{ padding: '0.5rem', fontWeight: '500' }}>{c.nome}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center', color: '#2563eb' }}>{c.lavagens_gratuitas || 0}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', color: '#059669' }}>{c.carimbos_acumulados}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Sem dados suficientes.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'precos' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Preços de Combustível (Landing Page)</h2>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Os preços definidos aqui serão mostrados em tempo real na página inicial pública.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Gasóleo Simples (€)</label>
                  <input type="text" value={fuelPrices.gasoleo} onChange={e => setFuelPrices({...fuelPrices, gasoleo: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Gasolina 95 (€)</label>
                  <input type="text" value={fuelPrices.gasolina} onChange={e => setFuelPrices({...fuelPrices, gasolina: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>GPL Auto (€)</label>
                  <input type="text" value={fuelPrices.gas} onChange={e => setFuelPrices({...fuelPrices, gas: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              
              <button onClick={handleSaveFuelPrices} className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', padding: '1rem' }}>
                Guardar e Atualizar Preços
              </button>
            </div>
          </div>
        )}

        {activeTab === 'marcacoes' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={24} /> Pedidos de Marcação (Fila de Espera)
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fde68a' }}>
                <p style={{ color: '#b45309', fontWeight: 'bold', marginBottom: '0.5rem' }}>Pendentes</p>
                <p style={{ fontSize: '2rem', fontWeight: '900', color: '#d97706' }}>{bookings.filter(b => b.estado === 'pendente').length}</p>
              </div>
              <div style={{ background: '#d1fae5', padding: '1.5rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <p style={{ color: '#047857', fontWeight: 'bold', marginBottom: '0.5rem' }}>Aceites</p>
                <p style={{ fontSize: '2rem', fontWeight: '900', color: '#059669' }}>{bookings.filter(b => b.estado === 'aceite').length}</p>
              </div>
              <div style={{ background: '#fee2e2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <p style={{ color: '#b91c1c', fontWeight: 'bold', marginBottom: '0.5rem' }}>Rejeitadas</p>
                <p style={{ fontSize: '2rem', fontWeight: '900', color: '#dc2626' }}>{bookings.filter(b => b.estado === 'rejeitado').length}</p>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569' }}>Data/Período</th>
                    <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569' }}>Cliente</th>
                    <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569' }}>Telemóvel</th>
                    <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569' }}>Matrícula</th>
                    <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569' }}>Serviço</th>
                    <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569' }}>Estado</th>
                    <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', background: b.estado === 'pendente' ? '#fffbeb' : 'transparent' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{new Date(b.data_desejada).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{b.periodo}</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>
                        {b.nome} {b.cliente_id && <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '0.5rem' }}>VIP</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>{b.telemovel}</td>
                      <td style={{ padding: '1rem' }}>{b.matricula || '-'}</td>
                      <td style={{ padding: '1rem' }}>{b.servico}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.875rem', 
                          fontWeight: 'bold',
                          background: b.estado === 'pendente' ? '#fef3c7' : b.estado === 'aceite' ? '#d1fae5' : '#fee2e2',
                          color: b.estado === 'pendente' ? '#b45309' : b.estado === 'aceite' ? '#047857' : '#b91c1c'
                        }}>
                          {b.estado.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {b.estado === 'pendente' && (
                            <>
                              <button onClick={() => handleBookingAction(b.id, 'aceite')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Aceitar</button>
                              <button onClick={() => handleBookingAction(b.id, 'rejeitado')} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Rejeitar</button>
                            </>
                          )}
                          {!b.cliente_id && (
                            <button onClick={() => handleConvertBookingToCustomer(b)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Plus size={16} /> Criar Ficha
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Sem marcações registadas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Customer Details Modal */}
      {selectedCustomerForDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Ficha de Cliente: {selectedCustomerForDetails.nome}</h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {selectedCustomerForDetails.numero_cliente} • Registo: {new Date(selectedCustomerForDetails.criado_em).toLocaleDateString()}
                </div>
              </div>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setSelectedCustomerForDetails(null)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Summary blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <p style={{ fontSize: '0.875rem', color: '#1d4ed8', marginBottom: '0.25rem' }}>Faturação Total</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                    {customerWashes.reduce((acc, w) => acc + (w.valor_pago || 0), 0).toFixed(2)}€
                  </p>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Lavagens</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {customerWashes.length}
                  </p>
                </div>
                <div style={{ background: 'rgba(217, 119, 6, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                  <p style={{ fontSize: '0.875rem', color: '#b45309', marginBottom: '0.25rem' }}>Vales Disponíveis (20€)</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>
                      {Math.floor((selectedCustomerForDetails.carimbos_acumulados || 0) / 10) - (selectedCustomerForDetails.vales_descontados || 0)}
                    </p>
                    {Math.floor((selectedCustomerForDetails.carimbos_acumulados || 0) / 10) - (selectedCustomerForDetails.vales_descontados || 0) > 0 && (
                      <button 
                        onClick={handleDescontarVale}
                        style={{ background: '#d97706', color: 'white', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(217,119,6,0.2)' }}
                      >
                        Descontar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              
              {/* Vehicles Section */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <Car size={18} style={{ marginRight: '0.5rem', color: 'var(--text-secondary)' }} /> Viaturas do Cliente
                </h3>
                {selectedCustomerForDetails.viaturas && selectedCustomerForDetails.viaturas.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {selectedCustomerForDetails.viaturas.map(v => (
                      <div key={v.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#0f172a' }}>{v.matricula.toUpperCase()}</span>
                          <button 
                            onClick={() => handleRemoveVehicle(v.id, v.matricula)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex' }}
                            title="Remover viatura"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {v.marca || 'Sem Marca'} {v.modelo ? `- ${v.modelo}` : ''} • <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{customerWashes.filter(w => w.matricula.toUpperCase() === v.matricula.toUpperCase()).length} lavagens</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                    Nenhuma viatura registada.
                  </div>
                )}
              </div>

              {/* Historic Wash Table */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <Car size={18} style={{ marginRight: '0.5rem', color: 'var(--text-secondary)' }} /> Histórico de Lavagens
                </h3>
                
                {customerWashes.length > 0 ? (
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.03)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Data e Hora</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Serviço</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Carimbo?</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Valor pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerWashes.map(w => (
                        <tr key={w.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                            {new Date(w.data).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                            {w.tipo_lavagem}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            {w.carimbos_ganhos > 0 ? (
                              <span style={{ color: '#059669', fontSize: '0.875rem' }}>Sim</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Não</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                            {Number(w.valor).toFixed(2)}€
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    O cliente ainda não realizou nenhuma lavagem.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Customer */}
      {isNewCustomerModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card animate-scale-up" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <Plus size={20} style={{ marginRight: '0.5rem', color: 'var(--accent-primary)' }} /> Novo Cliente
            </h2>
            <form onSubmit={handleCreateCustomer}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Nome *</label>
                  <input type="text" className="input" required value={newCustomerData.nome} onChange={e => setNewCustomerData({...newCustomerData, nome: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Telemóvel *</label>
                  <input type="text" className="input" required value={newCustomerData.telemovel} onChange={e => setNewCustomerData({...newCustomerData, telemovel: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">NIF (Opcional)</label>
                  <input type="text" className="input" value={newCustomerData.nif} onChange={e => setNewCustomerData({...newCustomerData, nif: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsNewCustomerModalOpen(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Vehicle Admin */}
      {selectedCustomerForVehicle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card animate-scale-up" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <Car size={20} style={{ marginRight: '0.5rem', color: 'var(--accent-primary)' }} /> Nova Viatura
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Associar à ficha de <b>{selectedCustomerForVehicle.nome}</b></p>
            <form onSubmit={handleAddVehicleAdmin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Matrícula *</label>
                  <input type="text" className="input" required placeholder="00-AA-00" value={newVehicleData.matricula} onChange={e => setNewVehicleData({...newVehicleData, matricula: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="block text-sm text-gray-700 mb-1">Marca</label>
                    <input type="text" className="input" placeholder="Ex: BMW" value={newVehicleData.marca} onChange={e => setNewVehicleData({...newVehicleData, marca: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="block text-sm text-gray-700 mb-1">Modelo</label>
                    <input type="text" className="input" placeholder="Ex: Serie 1" value={newVehicleData.modelo} onChange={e => setNewVehicleData({...newVehicleData, modelo: e.target.value})} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedCustomerForVehicle(null)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Viatura</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
