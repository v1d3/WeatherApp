import React from 'react';
import { useNavigate } from 'react-router-dom';

// import styles from '../styles/sidebar.module.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Sidebar = ({title, mainIcon, sections = []}) => {
    const navigate = useNavigate();

    return (
         <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark min-vh-100" style={{width: "280px"}}>
            <p className="d-flex align-items-center justify-content-center mb-0 text-white text-decoration-none aling-center">
                <FontAwesomeIcon icon={mainIcon} className="bi pe-none me-2"/>
                <span className="fs-4 fw-semibold">{title}</span>
            </p>
            <hr></hr>
            <ul className="nav nav-pills flex-column mb-auto gap-2">
                {sections.map((section, index) => {
                    return (
                        <li key={index} className='nav-item'>
                            <a
                                href=''
                                className={`nav-link text-white ${section.isActive ? "active" : ""}`}
                                style={{
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = section.isActive ? e.currentTarget.style.background : "#495057"}
                                onMouseLeave={e => e.currentTarget.style.background = section.isActive ? "#0d6efd" : "transparent"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(section.link);
                                }}
                            >
                                <FontAwesomeIcon icon={section.icon} className="bi pe-none me-2" />
                                {section.title}
                            </a>
                        </li>
                    )
                })}
            </ul>
            <hr></hr>
            <div>
                <a className='nav-link text-white text-center' href="#" onClick={(e) => {
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