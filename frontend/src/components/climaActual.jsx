import React, { useEffect, useState } from 'react';
import UserService from '../services/user.js';
import HelpButton from '../components/HelpButton';
import { Cloud, Wind, Droplets, Calendar, MapPin, Thermometer } from 'lucide-react';

function ClimaActual({ ciudadSeleccionada, setCiudadSeleccionada, onWeatherIdChange }) {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState(null);
    const [fechaHora, setFechaHora] = useState('');
    const [ciudadInput, setCiudadInput] = useState('');

    const formatearFecha = (fechaString) => {
        try {
            const fecha = new Date(fechaString);

            const meses = [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ];

            const dia = fecha.getDate();
            const mes = meses[fecha.getMonth()];

            let hora = fecha.getHours();
            let ampm = hora >= 12 ? 'pm' : 'am';
            hora = hora % 12;
            hora = hora ? hora : 12;

            return `${dia} de ${mes}, ${hora}${ampm}`;
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
            return 'Fecha no disponible';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ciudadInput.trim()) {
            setCiudadSeleccionada(ciudadInput); 
        }
    };

    useEffect(() => {
        const actualizarDatos = async () => {
            try {
                const datosObtenidos = ciudadSeleccionada 
                    ? await UserService.getWeatherDataByCity(ciudadSeleccionada)
                    : await UserService.getWeatherData();
                
                setDatos(datosObtenidos);
                console.log('Datos meteorológicos en componente:', datosObtenidos);
                
                if (datosObtenidos && datosObtenidos.clima && datosObtenidos.clima[0]) {
                    const fechaUTC = datosObtenidos.clima[0].dateTime;
                    const opciones = { timeZone: 'America/Santiago' };

                    const fechaLocal = fechaUTC.toLocaleString('es-CL', opciones);
                    console.log('Fecha local:', fechaLocal);
                    const fechaFormateada = formatearFecha(fechaLocal);
                    setFechaHora(fechaFormateada);
                }
            } catch (err) {
                console.error('Error al actualizar datos:', err);
                setError(err.message);
            }
        };

        actualizarDatos();
        
        // Actualizar datos cada hora
        const intervaloTiempo = setInterval(() => {
            actualizarDatos();
        }, 3600000);

        return () => clearInterval(intervaloTiempo);
    }, [ciudadSeleccionada]);

    useEffect(() => {
    if (
            datos &&
            datos.clima &&
            datos.clima[0] &&
            datos.clima[0].weather &&
            datos.clima[0].weather.id
        ) {
            onWeatherIdChange && onWeatherIdChange(datos.clima[0].weather.id);
        }
    }, [datos, onWeatherIdChange]);

    return (
        <>
            {/* Search Section */}
            <div className="mb-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <form onSubmit={handleSubmit} className="position-relative">
                            <div className="input-group">
                                <input
                                    id="ciudad-input"
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={ciudadInput}
                                    onChange={(e) => setCiudadInput(e.target.value)}
                                    placeholder="Ej: Santiago"
                                    style={{ 
                                        borderRadius: '0.75rem 0 0 0.75rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white'
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-lg"
                                    style={{ 
                                        borderRadius: '0 0.75rem 0.75rem 0',
                                        backgroundColor: '#156DB5',
                                        border: 'none'
                                    }}
                                >
                                    Buscar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    {/* Tarjeta principal */}
                    <div className="card bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 shadow-lg"
                         style={{ borderRadius: '1.5rem' }}>
                        <div className="card-body p-4">
                            <div className="row g-4">
                                <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <span className="badge bg-white bg-opacity-20 px-3 py-2 rounded-pill">
                                            <Calendar className="me-1" style={{ width: '1rem', height: '1rem' }} />
                                            <span className="fw-semibold text-black">
                                                {fechaHora || 'Fecha desconocida'}
                                            </span>
                                        </span>
                                    </div>

                                    {datos ? (
                                        <>
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <Thermometer style={{ width: '2rem', height: '2rem', color: 'rgba(0, 0, 0, 0.8)' }} />
                                                <span className="display-1 fw-bold text-black">
                                                    {datos.clima?.[0]?.temperature !== undefined
                                                        ? `${datos.clima[0].temperature}°`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Cloud style={{ width: '2rem', height: '2rem', color: 'rgba(0, 0, 0, 0.8)' }} />
                                                <span className="h4 fw-semibold text-black">
                                                    {datos.clima?.[0]?.weather?.name
                                                        ? datos.clima[0].weather.name.charAt(0).toUpperCase() +
                                                          datos.clima[0].weather.name.slice(1)
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 text-black-50">
                                                <MapPin style={{ width: '1.25rem', height: '1.25rem' }} />
                                                <small>{datos.ciudad || 'Ubicación desconocida'}</small>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-black">Cargando clima...</p>
                                    )}
                                </div>

                                {/* Columna derecha: datos adicionales */}
                                <div className="col-12 col-md-6">
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div className="card bg-white bg-opacity-10 text-center h-100"
                                                 style={{ borderRadius: '0.75rem' }}>
                                                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                                    <Droplets className="mb-2 text-black" style={{ width: '1.5rem', height: '1.5rem' }} />
                                                    <small className="text-black-50 mb-1">Humedad</small>
                                                    <h5 className="fw-bold text-black mb-0">
                                                        {datos?.clima?.[0]?.humidity !== undefined
                                                            ? `${datos.clima[0].humidity}%`
                                                            : 'N/A'}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="card bg-white bg-opacity-10 text-center h-100"
                                                 style={{ borderRadius: '0.75rem' }}>
                                                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                                    <Wind className="mb-2 text-black" style={{ width: '1.5rem', height: '1.5rem' }} />
                                                    <small className="text-black-50 mb-1">Viento</small>
                                                    <h5 className="fw-bold text-black mb-0">
                                                        {datos?.clima?.[0]?.windSpeed !== undefined
                                                            ? `${datos.clima[0].windSpeed} km/h`
                                                            : 'N/A'}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 d-flex justify-content-center">
                                            <HelpButton ciudadSeleccionada={ciudadSeleccionada} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ClimaActual;
