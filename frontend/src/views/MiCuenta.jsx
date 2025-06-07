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
    <>
      <BarraSuperior onLogout={logOut} />
      <div className="d-flex">
        <div
          className="d-flex flex-column flex-shrink-0 p-3"
          style={{ width: "250px", height: "92vh" , backgroundColor: '#4A95D3', color: '#ffffff' }}
        >
          <p className="d-flex align-items-center justify-content-center mb-0 text-white text-decoration-none text-center">
            <FontAwesomeIcon icon={faCircleUser} className="bi pe-none me-2" />
            <span className="fs-4 fw-semibold">Mi Cuenta</span>
          </p>
          <hr />
          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link text-white ${seccionActiva === 'perfil' ? 'active' : ''}`}
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

        <div className="p-4" style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
}

export default MiCuenta;
