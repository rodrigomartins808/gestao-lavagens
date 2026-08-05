import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Placeholder para Logotipo Oficial */}
        {/* <img src="/logo-oficial.png" alt="Logotipo" style={{ height: '32px' }} /> */}
        <div style={{ 
          background: 'var(--accent-primary)', 
          color: 'white', 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          PG
        </div>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Posto Lavagem</h2>
      </div>
      <div className="navbar-right">
        <span className="user-name">{user?.name}</span>
        <span className="badge">{user?.role === 'admin' ? 'Administrador' : 'Funcionário'}</span>
        <button className="btn-outline" onClick={onLogout}>Sair</button>
      </div>
    </nav>
  );
};

export default Navbar;
