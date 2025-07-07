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
            <div className="mb-3">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <style>
                        {`
                        #ciudad-input::placeholder {
                            color: rgba(255, 255, 255, 0.7);
                            opacity: 1;
                        }
                        `}
                    </style>
                        <form onSubmit={handleSubmit} className="position-relative">
                            <div className="input-group">
                                <input
                                    id="ciudad-input"
                                    type="text"
                                    className="form-control"
                                    value={ciudadInput}
                                    onChange={(e) => setCiudadInput(e.target.value)}
                                    placeholder="Ej: Santiago"
                                    style={{ 
                                        borderRadius: '0.5rem 0 0 0.5rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        fontSize: '0.875rem'
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    style={{ 
                                        borderRadius: '0 0.5rem 0.5rem 0',
                                        background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
                                        border: 'none',
                                        fontSize: '0.875rem'
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
                         style={{ borderRadius: '1rem' }}>
                        <div className="card-body p-3">
                            <div className="row g-3">
                                <div className="col-12 col-md-3 d-flex flex-column justify-content-center">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="badge px-2 py-1 rounded-pill" style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            color: 'white' // Cambiar a blanco
                                        }}>
                                            <Calendar className="me-1" style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                                            <span className="fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                {fechaHora || 'Fecha desconocida'}
                                            </span>
                                        </span>
                                    </div>

                                    {datos ? (
                                        <>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Thermometer style={{ width: '1.5rem', height: '1.5rem', color: 'rgba(255, 255, 255, 0.8)' }} />
                                                <span className="display-4 fw-bold text-white">
                                                    {datos.clima?.[0]?.temperature !== undefined
                                                        ? `${datos.clima[0].temperature}°`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Cloud style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.8)' }} />
                                                <span className="h5 fw-semibold text-white">
                                                    {datos.clima?.[0]?.weather?.name
                                                        ? datos.clima[0].weather.name.charAt(0).toUpperCase() +
                                                          datos.clima[0].weather.name.slice(1)
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 text-white-50">
                                                <MapPin style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                                                <small>{datos.ciudad || 'Ubicación desconocida'}</small>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-white">Cargando clima...</p>
                                    )}
                                </div>

                                {/* Columna derecha: datos adicionales */}
                                <div className="col-12 col-md-9 d-flex flex-row justify-content-between">
                                    <div className="col-10 d-flex flex-row gap-3 py-3">
                                        <div className="col-5 flex-column justify-content-center">
                                            <div className="card bg-white bg-opacity-10 text-center h-100"
                                                 style={{ borderRadius: '0.5rem' }}>
                                                <div className="card-body d-flex flex-column align-items-center justify-content-center py-2">
                                                    <Droplets className="mb-1 text-white" style={{ width: '1rem', height: '1rem' }} />
                                                    <small className="text-white-50 mb-1" style={{ fontSize: '0.625rem' }}>Humedad</small>
                                                    <h6 className="fw-bold text-white mb-0">
                                                        {datos?.clima?.[0]?.humidity !== undefined
                                                            ? `${datos.clima[0].humidity}%`
                                                            : 'N/A'}
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-5 flex-column justify-content-center">
                                            <div className="card bg-white bg-opacity-10 text-center h-100"
                                                 style={{ borderRadius: '0.5rem' }}>
                                                <div className="card-body d-flex flex-column align-items-center justify-content-center py-2">
                                                    <Wind className="mb-1 text-white" style={{ width: '1rem', height: '1rem' }} />
                                                    <small className="text-white-50 mb-1" style={{ fontSize: '0.625rem' }}>Viento</small>
                                                    <h6 className="fw-bold text-white mb-0">
                                                        {datos?.clima?.[0]?.windSpeed !== undefined
                                                            ? `${datos.clima[0].windSpeed} km/h`
                                                            : 'N/A'}
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col 1 d-flex self-stretch justify-end'>
                                        <HelpButton ciudadSeleccionada={ciudadSeleccionada} />
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
