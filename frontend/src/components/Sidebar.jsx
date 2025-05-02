import React from 'react';
import { useNavigate } from 'react-router-dom';

// import styles from '../styles/sidebar.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer, faPersonRunning, faCloud } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({activeIndex}) => {
    const navigate = useNavigate();

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark" style={{width: "280px"}}>
            <p className="d-flex align-items-center justify-content-center mb-0 text-white text-decoration-none aling-center">
                <FontAwesomeIcon icon={faHammer} className="bi pe-none me-2"/>
                <span className="fs-4 fw-semibold">Administración</span>
            </p>
            <hr></hr>
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <a href='' className={`nav-link text-white ${activeIndex == 1 ? "active" : ""}`}
                    
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/admin/forecast');
                        }}>
                        <FontAwesomeIcon icon={faCloud} className="bi pe-none me-2"/>
                        Añadir Pronóstico
                    </a>
                </li>
                <li className="nav-item">
                    <a href='' className={`nav-link text-white ${activeIndex == 2 ? "active" : ""}`}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/admin/activities');
                        }}>
                        <FontAwesomeIcon icon={faPersonRunning} className="bi pe-none me-2" />
                        Añadir Actividad
                    </a>
                </li>
            </ul>
            <hr></hr>
            <div>
                <a className='nav-link text-white' href="#" onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem('UserLoged');
                    navigate('/login');
                }
                }>
                    <strong>Cerrar sesión</strong>
                </a>

            </div>
        </div>

    );
}

export default Sidebar;