import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';

const Login = lazy(() => import('./pages/Login'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CustomerPortal = lazy(() => import('./pages/CustomerPortal'));
const LiveQueue = lazy(() => import('./pages/LiveQueue'));
const CustomerTracking = lazy(() => import('./pages/CustomerTracking'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

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
        const dataService = (await import('./services/dataService')).default;
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
    const dataService = (await import('./services/dataService')).default;
    await dataService.logout();
    navigate('/');
  };

  const isStandaloneRoute = location.pathname === '/tv-v9k2' || location.pathname.startsWith('/tracking') || location.pathname === '/' || location.pathname === '/privacidade';

  return (
    <div className="app-container">
      {currentUser && !isStandaloneRoute && <Navbar user={currentUser} onLogout={handleLogout} />}
      
      <main className="main-content">
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>A carregar...</div>}>
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
        </Suspense>
      </main>
    </div>
  );
}