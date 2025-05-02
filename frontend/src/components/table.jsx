import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import styles from '../styles/user.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWind, faTemperatureThreeQuarters, faPercent, faCalendarDays } from '@fortawesome/free-solid-svg-icons';

function Table({ weatherData }) {
    // Función para formatear la fecha a hora chilena
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
                    {/* Mostrar solo las 4 horas siguientes (índices 1, 2, 3, 4) */}
                    {[1, 2, 3, 4].map((index) => {
                        const item = weatherData && weatherData.length > index ? weatherData[index] : null;
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
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
