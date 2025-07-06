import React from 'react';
import BarraSuperior from '../components/barraSuperior'; 
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPersonRunning, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import logoImg from '../assets/logoiq5.png';

function MiCuenta({ seccionActiva,children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logOut = () => {
    localStorage.removeItem('UserLoged');
    navigate('/login');
  };

  return (
    <main className="vh-100 overflow-hidden"> 
      <BarraSuperior onLogout={logOut} />
      <div className="d-flex h-100">
        <div
          className="d-flex flex-column flex-shrink-0 p-3"
          style={{ width: "250px", height: "92vh", backgroundColor: '#4A95D3', color: '#ffffff' }}
        >
          <p className="d-flex align-items-center justify-content-center mb-0 text-white text-decoration-none text-center">
            <FontAwesomeIcon icon={faCircleUser} className="bi pe-none me-2" />
            <span className="fs-4 fw-semibold">Mi Cuenta</span>
          </p>
          {/* <img src={logoImg} className="img-fluid my-3 m-auto" style={{ maxWidth: '120px', height: 'auto' }} alt="Logo" /> */}
          <hr />
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

        <div className="p-4 overflow-auto" style={{ flex: 1, height: "92vh" }}>
          {children}
        </div>
      </div>
    </main>
  );
}

export default MiCuenta;
