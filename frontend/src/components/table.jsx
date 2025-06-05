import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/user.module.css';
import React, { useEffect, useState } from 'react';
import UserService from '../services/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faTemperatureThreeQuarters, faPercent, faWind } from '@fortawesome/free-solid-svg-icons';

function Table({ ciudadSeleccionada }) {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Formatear hora (función existente)
    const formatToChileanTime = (dateTimeString) => {
        if (!dateTimeString || dateTimeString === 'N/A') return 'N/A';

        try {
            // Crear objeto Date a partir del string
            const date = new Date(dateTimeString);

            // Opciones para formatear la hora en español Chile
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Santiago',
                hour12: true
            };

            // Formatear solo la hora
            return new Intl.DateTimeFormat('es-CL', options).format(date);
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return dateTimeString;
        }
    };

    useEffect(() => {
        const obtenerDatosHorarios = async () => {
            try {
                setCargando(true);
                console.log("Obteniendo pronóstico para ciudad:", ciudadSeleccionada || "geolocalización");
                
                // Usar ciudadSeleccionada si existe
                const datosHorarios = await UserService.getHourlyWeatherData(4, ciudadSeleccionada);
                setDatos(datosHorarios);
                setError(null);
            } catch (err) {
                console.error("Error en Tabla:", err);
                setError("Error al cargar el pronóstico: " + err.message);
                setDatos(null);
            } finally {
                setCargando(false);
            }
        };

        obtenerDatosHorarios();
    }, [ciudadSeleccionada]); // Dependencia para actualizar cuando cambia la ciudad

    return (
        <div style={{ position: 'absolute', top: '69vh', left: '6vw' }}>
            <table className={`table table-hover table-sm ${styles.tabla}`} style={{ width: '35vw' }}>
                <thead>
                    <tr>
                        <th>
                            Fecha
                            <span style={{ marginLeft: '8px', fontSize: '1em' }}>
                                <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" />
                            </span>
                        </th>
                        <th>
                            Temperatura
                            <span style={{ marginLeft: '8px', fontSize: '1em' }}>
                                <FontAwesomeIcon icon={faTemperatureThreeQuarters} color="#5dade2" />
                            </span>
                        </th>
                        <th>
                            Humedad
                            <span style={{ marginLeft: '8px', fontSize: '1em' }}>
                                <FontAwesomeIcon icon={faPercent} color="#5dade2" />
                            </span>
                        </th>
                        <th>
                            Viento
                            <span style={{ marginLeft: '8px', fontSize: '1em' }}>
                                <FontAwesomeIcon icon={faWind} color="#5dade2" />
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {cargando ? (
                        <tr>
                            <td colSpan="4" className="text-center">Cargando...</td>
                        </tr>
                    ) : (
                        [1, 2, 3, 4].map((index) => {
                            const item = datos && datos.length > index ? datos[index] : null;
                            return (
                                <tr key={index}>
                                    <td style={{ textAlign: 'center' }}>
                                        {item ? formatToChileanTime(item.dateTime) : 'N/A'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item && item.temperature !== 'N/A' ? `${item.temperature}°C` : 'N/A'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item && item.humidity !== 'N/A' ? `${item.humidity}%` : 'N/A'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item && item.windSpeed !== 'N/A' ? `${item.windSpeed} km/h` : 'N/A'}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
