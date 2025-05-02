import solGIF from '../assets/sol.gif';
import '../App.css';
import UserService from '../services/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { Navbar, Nav } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import styles from '../styles/user.module.css';
import { useNavigate } from 'react-router-dom';
import Table from '../components/table';
import TablaR from '../components/tabla_recomendacion';
import ClimaActual from '../components/climaActual';
function User() {
    const [sobreponer, setsobreponer] = useState(false);
    const [sobre, setsobre] = useState(false);
    const [weatherData, setWeatherData] = useState([]);
    const navigate = useNavigate();

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
            <Navbar className={`me-auto ${styles.navbar}`}>
                <Nav className={`me-auto ${styles.navbar}`}>
                    <Nav.Link
                        href="#cuenta"
                        style={{ color: sobreponer ? '#FFD700' : 'white', position: 'fixed', top: '1vh', right: '5vw', }}
                        onMouseEnter={() => setsobreponer(true)}
                        onMouseLeave={() => setsobreponer(false)}
                    >
                        Mi cuenta
                    </Nav.Link>
                </Nav>
            </Navbar>
            <div className={`middle ${styles.middle}`}>
            
                <img src={solGIF} className={`middle ${styles.weather}`} alt="solGIF" />
                <ClimaActual/>
                <div className={`${styles.update}`}>
                    <FontAwesomeIcon icon={faRotateRight} size="1x" onClick={fetchWeatherData} /></div>

                <div className={`middle ${styles.recomendacion}`}>
                    <TablaR />
                </div>


            </div>
            <div className={`middle ${styles.linea_inferior}`}>
                <div className={`middle ${styles.datos}`}>
                    <Table weatherData={weatherData} />
                    <div
                        style={{ color: sobre ? '#FFD700' : '#FFFFFF', position: 'fixed', top: '1vh', right: '2vw', cursor: 'pointer', }}
                        onMouseEnter={() => setsobre(true)}
                        onMouseLeave={() => setsobre(false)}
                    >
                        <FontAwesomeIcon icon={faDoorOpen} size="2x" onClick={logOut} />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default User;
