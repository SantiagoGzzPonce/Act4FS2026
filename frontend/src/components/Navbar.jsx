import React from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ view, setView, user }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    setView('login');
  };

  return (
    <nav style={{
      backgroundColor: '#6b2d2d',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🏛️</span>
        <span style={{ fontWeight: 'bold' }}>Museo de Arte</span>
      </div>

      {!user ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setView('login')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'login' ? '#d4a373' : 'transparent',
              color: 'white',
              border: '1px solid #d4a373',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setView('register')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'register' ? '#d4a373' : 'transparent',
              color: 'white',
              border: '1px solid #d4a373',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Registrarse
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>👤 {user.email}</span>
          <span style={{
            backgroundColor: '#d4a373',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem'
          }}>
            {user.role}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#8b3a3a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;