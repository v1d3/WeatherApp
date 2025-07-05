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
        <div className="row justify-content-center">
            <div className="col-12">
                <div className="row g-2"> {/* Reduced gap */}
                    {cargando ? (
                        <div className="col-12 text-center text-white-50 py-2">Cargando...</div>
                    ) : error ? (
                        <div className="col-12 text-center text-danger py-2">{error}</div>
                    ) : datos && datos.length > 0 ? (
                        datos.slice(0, 5).map((item, index) => (
                            <div key={index} className="col-12 col-md-6 col-lg">
                                <div className="card bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 text-center h-100"
                                     style={{ borderRadius: '0.75rem', transition: 'all 0.3s ease' }}>
                                    <div className="card-body py-2 px-3"> {/* Reduced padding */}
                                        <div className="text-white-50 small mb-1"> {/* Reduced margin */}
                                            {item ? formatToChileanTime(item.dateTime) : 'N/A'}
                                            <span className="ms-1">
                                                <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" style={{ width: '0.75rem', height: '0.75rem' }} />
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-center mb-2"> {/* Reduced margin */}
                                            <span className="me-1">
                                                <FontAwesomeIcon icon={faTemperatureThreeQuarters} color="#5dade2" style={{ width: '1.25rem', height: '1.25rem' }} />
                                            </span>
                                            <span className="fs-6 fw-bold text-white"> {/* Reduced font size */}
                                                {item && item.temperature !== 'N/A' ? `${item.temperature}°C` : 'N/A'}
                                            </span>
                                        </div>

                                        <div className="text-white-50 small mb-1"> {/* Reduced margin */}
                                            <span className="me-1">
                                                <FontAwesomeIcon icon={faPercent} color="#5dade2" style={{ width: '0.75rem', height: '0.75rem' }} />
                                            </span>
                                            {item && item.humidity !== 'N/A' ? `${item.humidity}%` : 'N/A'}
                                        </div>

                                        <div className="text-white-50 small">
                                            <span className="me-1">
                                                <FontAwesomeIcon icon={faWind} color="#5dade2" style={{ width: '0.75rem', height: '0.75rem' }} />
                                            </span>
                                            {item && item.windSpeed !== 'N/A' ? `${item.windSpeed} km/h` : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center text-white-50 py-2">No hay datos disponibles</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Table;
