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
          className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          onClick={onLogout}
          title="Cerrar sesión"
        >
          <DoorOpen className="w-5 h-5 text-white" />
        </button>
        <button
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition-all duration-300"
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
