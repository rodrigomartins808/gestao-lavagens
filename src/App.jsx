import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CustomerPortal from './pages/CustomerPortal';
import LiveQueue from './pages/LiveQueue';
import CustomerTracking from './pages/CustomerTracking';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import dataService from './services/dataService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    const cardId = searchParams.get('id');
    if (cardId && !storedUser) {
      const fetchCustomer = async () => {
        const customer = await dataService.getCustomerById(cardId);
        if (customer) {
          handleLogin({ ...customer, role: 'customer' });
        }
      };
      fetchCustomer();
    }
  }, [searchParams]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    if (user.role === 'admin') navigate('/acesso-gerencia-x89f');
    else if (user.role === 'employee') navigate('/acesso-equipa-x89f');
    else navigate('/cliente');
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    await dataService.logout();
    navigate('/');
  };

  const isStandaloneRoute = location.pathname === '/tv-v9k2' || location.pathname.startsWith('/tracking') || location.pathname === '/' || location.pathname === '/privacidade';

  return (
    <div className="app-container">
      {currentUser && !isStandaloneRoute && <Navbar user={currentUser} onLogout={handleLogout} />}
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/acesso-gerencia-x89f" element={
            !currentUser ? <Login type="admin" onLogin={handleLogin} /> :
            currentUser.role === 'admin' ? <AdminDashboard currentUser={currentUser} /> :
            <Navigate to="/" />
          } />

          <Route path="/acesso-equipa-x89f" element={
            !currentUser ? <Login type="employee" onLogin={handleLogin} /> :
            ['admin', 'employee'].includes(currentUser.role) 
              ? <EmployeeDashboard currentUser={currentUser} /> 
              : <Navigate to="/" />
          } />
          
          <Route path="/cliente" element={
            !currentUser ? <Login type="customer" onLogin={handleLogin} /> :
            currentUser.role === 'customer' 
              ? <CustomerPortal currentUser={currentUser} /> 
              : <Navigate to="/" />
          } />
          
          <Route path="/cartao" element={
            !currentUser ? <Login type="customer" onLogin={handleLogin} /> :
            currentUser.role === 'customer' 
              ? <CustomerPortal currentUser={currentUser} /> 
              : <Navigate to="/" />
          } />

          <Route path="/tv-v9k2" element={<LiveQueue />} />
          <Route path="/tracking/:id" element={<CustomerTracking />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}