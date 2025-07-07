import React from 'react';
import BarraSuperior from '../components/barraSuperior'; 
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPersonRunning, faCircleUser } from '@fortawesome/free-solid-svg-icons';

function MiCuenta({ seccionActiva,children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logOut = () => {
    localStorage.removeItem('UserLoged');
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #ec4899 100%)',
      position: 'relative',
      zIndex: 0,
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Background decorative elements */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '25%',
          width: '24rem',
          height: '24rem',
          background: 'linear-gradient(to right, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: '25%',
          width: '20rem',
          height: '20rem',
          background: 'linear-gradient(to left, rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'pulse 2s infinite',
          animationDelay: '1s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '16rem',
          height: '16rem',
          background: 'linear-gradient(to top right, rgba(67, 56, 202, 0.1), rgba(34, 211, 238, 0.1))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'pulse 2s infinite',
          animationDelay: '0.5s'
        }}></div>
      </div>

      <div style={{ 
        position: 'fixed', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 1050,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '1rem',
        padding: '0.5rem',
        backdropFilter: 'blur(10px)'
      }}>
        <BarraSuperior onLogout={logOut} />
      </div>
      
      <div className="d-flex" style={{ margin: 0, padding: 0, minHeight: '100vh', position: 'relative', zIndex: 10 }}>
        <div
          className="d-flex flex-column flex-shrink-0 p-3"
          style={{ 
            width: "250px", 
            minHeight: "100vh", 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff' 
          }}
        >
          <p className="d-flex align-items-center justify-content-center mb-0 text-white text-decoration-none text-center">
            <FontAwesomeIcon icon={faCircleUser} className="bi pe-none me-2" />
            <span className="fs-4 fw-semibold">Mi Cuenta</span>
          </p>
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} />
          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link text-white ${seccionActiva === 'perfil' ? 'active' : ''}`}
                style={{
                  backgroundColor: seccionActiva === 'perfil' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: seccionActiva === 'perfil' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/mi-cuenta/perfil');
                }}
              >
                <FontAwesomeIcon icon={faUser} className="bi pe-none me-2" />
                Perfil
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link text-white ${seccionActiva === 'preferencias' ? 'active' : ''}`}
                style={{
                  backgroundColor: seccionActiva === 'preferencias' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: seccionActiva === 'preferencias' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/mi-cuenta/preferencias');
                }}
              >
                <FontAwesomeIcon icon={faPersonRunning} className="bi pe-none me-2" />
                Preferencias
              </a>
            </li>
          </ul>
        </div>

        <div className="p-4" style={{ 
          flex: 1, 
          paddingTop: '6rem', 
          paddingRight: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default MiCuenta;