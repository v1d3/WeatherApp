import solGIF from '../assets/sol.gif';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTemperatureThreeQuarters, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';

function User() {
    const [sobreponer, setsobreponer] = useState(false);
    const [weatherData, setWeatherData] = useState(null);

    const linea_inferior = {
        width: '100vw',
        height: '38vh',
        backgroundColor: 'skyblue',
        position: 'fixed',
        bottom: 0,
    };
    const barra = {
        width: '100vw',
        height: '8vh',
        backgroundColor: '#156DB5',
        position: 'fixed',
        top: 0,
    };
    const datos = {
        width: '40vw',
        height: '30vh',
        backgroundColor: 'white',
        top: '66vh',
        left: '2vw',
        position: 'fixed',
        borderRadius: '10px',
    };
    const recomendacion = {
        width: '40vw',
        height: '45vh',
        backgroundColor: "#5dade2",
        top: '12vh',
        right: '4vw',
        position: 'fixed',
        borderRadius: '15px',
    };

    async function fetchWeatherData() {
        try {

            // Obtener la fecha y hora actual en formato ISO 8601
            // y convertirla a la zona horaria de Chile (America/Santiago)
            const fechaActual = new Date();
            const fechaChile = fechaActual.toLocaleString('en-US', {
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const [date, time] = fechaChile.split(', ');
            const [month, day, year] = date.split('/');
            const fechaISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}:00.032Z`;

            console.log('Fecha actual:', fechaISO);

            // Obtener la ubicación del usuario (solamente nos interesa la ciudad)
            const position = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject)
            );

            console.log('Ubicación obtenida:', position.coords);

            const { latitude, longitude } = position.coords;

            console.log('Latitud:', latitude);
            console.log('Longitud:', longitude);

            const responseGeo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const dataGeo = await responseGeo.json();
            const ciudad = dataGeo.address.city || dataGeo.address.town || dataGeo.address.village || 'Desconocida';
            console.log('Ciudad:', ciudad);

            // Obtener el clima desde la api
            const responseWeather = await axios.get('http://localhost:8080/api/v1/weather-data', {
                params: {
                    location: ciudad,
                    dateTime: fechaISO
                },
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNzQ1ODQ5NzI2LCJleHAiOjE3NDU5MzYxMjZ9.sbRW5SUTxS5aewC8FXRTihETtWVPp0xFmwsdNEpp3-E'
                }
            });

            console.log('Datos del clima:', responseWeather.data);
            //setWeatherData(dataWeather);
        } catch (error) {
            console.error('Error al obtener los datos del clima:', error);
        }
    }

    return (
        <>
            <Navbar style={barra}>
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
            <div>
                <div style={linea_inferior}></div>
                <div style={recomendacion}></div>
                <div style={datos}></div>
                <div>
                    <Button
                        onClick={fetchWeatherData}
                        style={{ position: 'fixed', top: '60vh', left: '2vw' }}
                    >
                        Obtener Clima
                    </Button>
                    <div>
                        <img src={solGIF} className="weather" alt="solGIF" style={{ position: 'absolute', top: '15vh', left: '2vw' }} />
                    </div>
                </div>

                <div>
                    <FontAwesomeIcon icon={faTemperatureThreeQuarters} color="#5dade2" size="2x" style={{ position: 'fixed', top: '69vh', left: '4.5vw' }} />
                    <FontAwesomeIcon icon={faClock} color="#5dade2" size="2x" style={{ position: 'fixed', top: '77vh', left: '4vw' }} />
                    <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" size="2x" style={{ position: 'fixed', top: '85vh', left: '4vw' }} />
                </div>


            </div>
        </>
    );
}

export default User;

