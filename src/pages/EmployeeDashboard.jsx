import React, { useState, useEffect } from 'react';
import { LogOut, Bell, CheckCircle, Clock, User, PlusCircle } from 'lucide-react';
import dataService from '../services/dataService';
import whatsappService from '../services/whatsappService';
import QuickSearch from '../components/QuickSearch';
import CustomerCard from '../components/CustomerCard';
import WashModal from '../components/WashModal';
import NewCustomerModal from '../components/NewCustomerModal';
import AddVehicleModal from '../components/AddVehicleModal';

export default function EmployeeDashboard({ currentUser }) {
  const [activeWashes, setActiveWashes] = useState([]);
  const [stats, setStats] = useState({ totalWashes: 0, totalRevenue: 0, newCustomers: 0 });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Modals state
  const [isWashModalOpen, setIsWashModalOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    loadDashboardData();
    // Poll for updates every 60s
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const handleNotifyReady = (customer, vehicle) => {
    if (customer && customer.telemovel) {
      const msg = whatsappService.generateCarReadyMessage(customer, vehicle);
      whatsappService.openWhatsApp(customer.telemovel, msg);
    }
  };

  const handleCompleteWash = async (washId) => {
    try {
      await dataService.updateWashStatus(washId, 'pronto');
      loadDashboardData();
    } catch (error) {
      console.error("Erro ao atualizar lavagem:", error);
    }
  };

  const handleRegisterAnonymousWash = async (tipo_servico, valor) => {
    try {
      await dataService.registerAnonymousWash({
        tipo_servico,
        valor,
        registado_por: currentUser.id
      });
      loadDashboardData();
    } catch (error) {
      console.error("Erro ao registar lavagem anónima:", error);
    }
  };

  return (
    <div className="dashboard min-h-screen bg-gray-50">
      <div style={{ padding: '0 0 1.5rem 0', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem', marginRight: '0.75rem' }}>PG</div>
          Painel de Operador
        </h1>
      </div>

      <main className="p-6 max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Stats Row (Daily Reset) */}
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div className="stat-card bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500" style={{ padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Lavagens Hoje (Com Ficha)</h3>
            <p className="text-3xl font-bold mt-2">{stats?.todayRegisteredWashes || 0}</p>
          </div>
          <div className="stat-card bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-500" style={{ padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #64748b' }}>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Lavagens Hoje (Sem Registo)</h3>
            <p className="text-3xl font-bold mt-2">{stats?.todayAnonymousWashes || 0}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* Main Action Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Quick Anonymous Wash */}
            <div className="card bg-white p-6 rounded-lg shadow-sm" style={{ padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h2 className="text-lg font-bold mb-4" style={{ marginBottom: '1rem' }}>Lavagem Rápida (Cliente Anónimo)</h2>
              <div className="flex flex-wrap gap-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    handleRegisterAnonymousWash('Lavagem Completa', 15);
                    loadDashboardData();
                  }}
                  style={{ 
                    background: '#f1f5f9', color: 'var(--text-primary)', padding: '1rem 1.5rem', 
                    flex: 1,
                    minWidth: '140px',
                    borderRadius: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px -3px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(59, 130, 246, 0.5)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(59, 130, 246, 0.4)'; }}
                >
                  Completa (15€)
                </button>
                <button 
                  onClick={() => {
                    handleRegisterAnonymousWash('Lavagem Exterior', 7);
                    loadDashboardData();
                  }}
                  style={{ 
                    background: '#f1f5f9', color: 'var(--text-primary)', padding: '1rem 1.5rem', 
                    flex: 1,
                    minWidth: '140px',
                    borderRadius: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px -3px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(16, 185, 129, 0.5)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(16, 185, 129, 0.4)'; }}
                >
                  Exterior (7€)
                </button>
                <button 
                  onClick={() => {
                    handleRegisterAnonymousWash('Lavagem Interior', 8);
                    loadDashboardData();
                  }}
                  style={{ 
                    background: '#f1f5f9', color: 'var(--text-primary)', padding: '1rem 1.5rem', 
                    flex: 1,
                    minWidth: '140px',
                    borderRadius: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px -3px rgba(139, 92, 246, 0.4)',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(139, 92, 246, 0.5)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(139, 92, 246, 0.4)'; }}
                >
                  Interior (8€)
                </button>
              </div>
            </div>

            <div className="card bg-white p-6 rounded-lg shadow-sm" style={{ padding: '1.5rem', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Pesquisa de Cliente</h2>
                <button 
                  className="btn btn-primary flex-center"
                  onClick={() => handleCreateNewCustomer('')}
                  style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  <PlusCircle size={20} className="mr-2" style={{ marginRight: '0.5rem' }} /> 
                  Criar Novo Cliente / Ficha
                </button>
              </div>
              
              <QuickSearch 
                onSelectCustomer={handleSelectCustomer} 
                onCreateNew={handleCreateNewCustomer} 
              />
            </div>

            {selectedCustomer && (
              <div className="mt-6 animate-fade-in" style={{ marginTop: '1.5rem' }}>
                <div className="flex-between mb-4" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 className="text-lg font-bold">Cliente Selecionado</h2>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedCustomer(null)}>
                    Limpar
                  </button>
                </div>
                <CustomerCard 
                  customer={selectedCustomer} 
                  vehicles={selectedCustomer.vehicles}
                  onRegisterWash={() => setIsWashModalOpen(true)}
                  onNotifyReady={handleNotifyReady}
                />
                <button 
                  className="btn btn-outline w-full mt-4 flex-center"
                  onClick={() => setIsAddVehicleOpen(true)}
                  style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', display: 'flex', justifyContent: 'center' }}
                >
                  <PlusCircle size={16} className="mr-2" style={{ marginRight: '0.5rem' }} /> Adicionar Viatura
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Modals */}
      <NewCustomerModal 
        isOpen={isNewCustomerOpen} 
        onClose={() => setIsNewCustomerOpen(false)} 
        onSave={(c) => {
          setIsNewCustomerOpen(false);
          handleSelectCustomer(c);
          loadDashboardData();
        }}
        prefillData={searchQuery}
      />

      {selectedCustomer && (
        <>
          <WashModal 
            isOpen={isWashModalOpen} 
            onClose={() => setIsWashModalOpen(false)}
            customer={selectedCustomer}
            vehicles={selectedCustomer.vehicles}
            currentUser={currentUser}
            onSave={() => {
              setIsWashModalOpen(false);
              loadDashboardData();
              handleSelectCustomer(selectedCustomer); // Reload customer to update stamps
            }}
          />

          <AddVehicleModal 
            isOpen={isAddVehicleOpen}
            onClose={() => setIsAddVehicleOpen(false)}
            customerId={selectedCustomer.id}
            onSave={() => {
              setIsAddVehicleOpen(false);
              handleSelectCustomer(selectedCustomer);
            }}
          />
        </>
      )}
    </div>
  );
}