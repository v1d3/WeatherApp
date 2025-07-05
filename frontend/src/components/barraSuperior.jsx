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
    <div className="w-full flex justify-end items-center p-4 z-20 relative">
      <div className="flex items-center space-x-3">
        <button
          style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onClick={onLogout}
          title="Cerrar sesión"
        >
          <DoorOpen className="w-5 h-5 text-white" />
        </button>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onClick={() => navigate(destinoBoton)}
        >
          <IconoBoton className="w-5 h-5 text-white" />
          <span className="text-white font-medium">{textoBoton}</span>
        </button>
      </div>
    </div>
  );
}

export default BarraSuperior;
