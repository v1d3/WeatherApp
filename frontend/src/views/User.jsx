import solGIF from '../assets/sol.gif';
import '../App.css';
import UserService from '../services/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import styles from '../styles/user.module.css';
import { useNavigate } from 'react-router-dom';
import Table from '../components/table';
import TablaR from '../components/tabla_recomendacion';
import ClimaActual from '../components/climaActual';
import BarraSuperior from '../components/barraSuperior';
import HelpButton from '../components/HelpButton';
// Add these imports for Navbar and Nav components
import { Navbar, Nav } from 'react-bootstrap';

function User() {
    const [sobre, setsobre] = useState(false);
    const [weatherData, setWeatherData] = useState([]);
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
    const [weatherId, setWeatherId] = useState(null);
    // Add missing state
    const [sobreponer, setsobreponer] = useState(false);
    const navigate = useNavigate();
    const weatherIdToIcon = {
        1: '01d',
        2: '02d',
        3: '03d',   // Nublado -> scattered clouds
        4: '04d',   // Muy nublado -> broken clouds
        10: '09d',  // Lluvia -> rain
        11: '10d',  // Llovizna -> shower rain
        12: '11d',  // Tormenta -> thunderstorm
        16: '13d',  // Nieve -> snow
        17: '50d',  // Neblina -> mist
        18: '50d',  // Niebla -> mist
        19: '50d',  // Polvo -> mist (or custom)
        20: '50d',  // Ceniza -> mist (or custom)
        21: '50d',  // Ráfagas -> mist (or custom)
        22: '50d',  // Tornado -> mist (or custom)
    };

    const logOut = () => {
        localStorage.removeItem('UserLoged');
        navigate('/login');
    };

    const fetchWeatherData = async () => {
        try {
            const now = new Date();
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);

            const weatherData = await UserService.getHourlyWeatherData(4);
            console.log('Datos del clima por hora:', weatherData);

            setWeatherData(weatherData);
        } catch (error) {
            console.error('Error al obtener clima:', error);
        }
    };

    const fetchActivities = async () => {
        try {
            console.log('Obteniendo actividades...');
            const activities = await UserService.getActivities();
            console.log('Actividades:', activities);
        } catch (error) {
            console.error('Error al obtener actividades:', error);
        }
    };

    useEffect(() => { fetchWeatherData(); }, []);

    return (
        <main className={`${styles.main}`}>
            {/* Replace Navbar with BarraSuperior */}
            <BarraSuperior onLogout={logOut} />

            <div className={`middle ${styles.middle}`}>
                {weatherId != null ? (
                    <img
                        src={`https://openweathermap.org/img/wn/${weatherIdToIcon[weatherId]}@4x.png`}
                        className={`middle ${styles.weather}`}
                        alt="weather icon"
                    />
                ) : (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                )}
                <ClimaActual
                    ciudadSeleccionada={ciudadSeleccionada}
                    setCiudadSeleccionada={setCiudadSeleccionada}
                    onWeatherIdChange={setWeatherId}
                />
                <HelpButton
                />
                <div className={`${styles.update}`}>
                    <FontAwesomeIcon icon={faRotateRight} size="1x" onClick={fetchWeatherData} />
                </div>

                <div className={`middle ${styles.recomendacion}`}>
                    <TablaR />
                </div>
            </div>
            <div className={`middle ${styles.linea_inferior}`}>
                <div className={`middle ${styles.datos}`}>
                    <Table
                        weatherData={weatherData}
                        ciudadSeleccionada={ciudadSeleccionada}
                    />
                    <div
                        style={{ color: sobre ? '#FFD700' : '#FFFFFF', position: 'fixed', top: '1vh', right: '2vw', cursor: 'pointer', }}
                        onMouseEnter={() => setsobre(true)}
                        onMouseLeave={() => setsobre(false)}>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default User;