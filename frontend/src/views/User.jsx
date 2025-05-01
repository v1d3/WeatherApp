import solGIF from '../assets/sol.gif';
import '../App.css';
import { getWeatherData } from '../services/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTemperatureThreeQuarters, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { Navbar, Nav } from 'react-bootstrap';
import React, { useState } from 'react';
import '../styles/user.css';
import { useNavigate } from 'react-router-dom';

function User() {
    const [sobreponer, setsobreponer] = useState(false);
    const navigate = useNavigate();

    const logOut = () => {
        localStorage.removeItem('UserLoged');
        navigate('/login');
    };

    async function fetchWeatherData() {
        try {
            const now = new Date();
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);

            const weatherData = await getWeatherData();
            console.log('Datos del clima:', weatherData);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <main>
            <Navbar>
                <Nav className="me-auto">
                    <Nav.Link
                        href="#cuenta"
                        style={{ color: sobreponer ? '#FFD700' : 'white', position: 'fixed', top: '2vh', right: '3vw' }}
                        onMouseEnter={() => setsobreponer(true)}
                        onMouseLeave={() => setsobreponer(false)}
                    >Mi cuenta
                    </Nav.Link>
                </Nav>
            </Navbar>
            <div className="middle">

                <img src={solGIF} className="weather" alt="solGIF" />

                <button onClick={fetchWeatherData}>
                    Obtener Clima
                </button>

                <div className='recomendacion'></div>
            </div>
            <div className='linea_inferior'>
                <div className='datos'>
                    <div>
                        <FontAwesomeIcon icon={faTemperatureThreeQuarters} color="#5dade2" size="2x" />
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faClock} color="#5dade2" size="2x" />
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" size="2x" />
                    </div>
                </div>
            </div>
            <button onClick={logOut}>Cerrar Sesión</button>
        </main>
    );
}

export default User;