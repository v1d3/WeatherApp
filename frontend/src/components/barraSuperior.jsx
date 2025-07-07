import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DoorOpen, DoorClosed, CircleUser, Home } from 'lucide-react';

function BarraSuperior({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const enMiCuenta = location.pathname.startsWith('/mi-cuenta');
  const textoBoton = enMiCuenta ? 'Página principal' : 'Mi cuenta';
  const destinoBoton = enMiCuenta ? '/user' : '/mi-cuenta/perfil';

  const IconoBoton = enMiCuenta ? Home : CircleUser;


  return (
    <div className="w-full flex justify-end items-center z-20 relative" style={{ margin: 0, padding: 0 }}>
      <div className="flex items-center space-x-3">
        <button
          style={{
            marginRight: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '50%',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
          onClick={onLogout}
          title="Cerrar sesión"
        >
          <DoorOpen className="w-5 h-5 text-gray-700" />
        </button>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
          onClick={() => navigate(destinoBoton)}
        >
          <IconoBoton className="w-5 h-5 text-gray-700" />
          <span className="text-gray-700 font-medium">{textoBoton}</span>
        </button>
      </div>
    </div>
  );
}

export default BarraSuperior;
