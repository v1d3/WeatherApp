import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/user.module.css';

function BarraSuperior({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const enMiCuenta = location.pathname.startsWith('/mi-cuenta');
  const textoBoton = enMiCuenta ? 'Página principal' : 'Mi cuenta';
  const destinoBoton = enMiCuenta ? '/user' : '/mi-cuenta/perfil'; 

  return (
    <Navbar className={styles.navbar}>
      <Nav className="ms-auto" style={{ gap: '1rem' }}>
        <Nav.Link
          style={{ color: 'white', cursor: 'pointer' }}
          onClick={() => navigate(destinoBoton)}
          onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
          onMouseLeave={e => e.currentTarget.style.color = 'white'}
        >
          {textoBoton}
        </Nav.Link>

        <Button
          variant="link"
          style={{ color: 'white', cursor: 'pointer' }}
          onClick={onLogout}
          onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
          onMouseLeave={e => e.currentTarget.style.color = 'white'}
        >
          <FontAwesomeIcon icon={faDoorOpen} size="2x" />
        </Button>
      </Nav>
    </Navbar>
  );
}

export default BarraSuperior;
