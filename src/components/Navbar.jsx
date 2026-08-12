import React from 'react';
import logo from '../assets/logo.jpeg';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logótipo" style={{ height: '56px', objectFit: 'contain' }} />
        </div>
      </div>
      <div className="navbar-right">
        <span className="user-name">{user?.name}</span>
        <button className="btn-outline" onClick={onLogout}>Sair</button>
      </div>
    </nav>
  );
};

export default Navbar;
