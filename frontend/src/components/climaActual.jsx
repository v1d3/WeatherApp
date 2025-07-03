import React, { useEffect, useState } from 'react';
import UserService from '../services/user.js';
import HelpButton from '../components/HelpButton';
import { Cloud, Wind, Droplets, Calendar,MapPin,Thermometer } from 'lucide-react';

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
    <div className="mb-8">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="relative">
        
          <input
            id="ciudad-input"
            type="text"
            value={ciudadInput}
            onChange={(e) => setCiudadInput(e.target.value)}
            placeholder="Ej: Santiago"
          />
          <button type="submit">Buscar</button>
        </form>
      </div>
    </div>
      
      <div className="w-full flex flex-col items-center">
        {/* Tarjeta principal */}
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 flex flex-col md:flex-row gap-6 text-black">
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold text-black">
                <Calendar className="w-4 h-4 mr-1 text-black" />
                {fechaHora || 'Fecha desconocida'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Thermometer className="w-8 h-8 text-black/80" />
              <span className="text-7xl font-bold">
                {datos?.clima?.[0]?.temperature !== undefined ? `${datos.clima[0].temperature}°` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Cloud className="w-8 h-8 text-black/80" />
              <span className="text-xl font-semibold">
                {datos?.clima?.[0]?.weather?.name
                  ? datos.clima[0].weather.name.charAt(0).toUpperCase() + datos.clima[0].weather.name.slice(1)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 opacity-80 text-sm">
              <MapPin className="w-5 h-5 text-black" />
              {datos?.ciudad || 'Ubicación desconocida'}
            </div>
          </div>
          {/* Columna derecha: datos adicionales */}
          
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center">
              <Droplets className="w-6 h-6 mb-2 text-black" />
              <span className="text-xs opacity-80 mb-1">Humedad</span>
              <span className="text-2xl font-bold">{datos?.clima?.[0]?.humidity !== undefined ? `${datos.clima[0].humidity}%` : 'N/A'}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center">
              <Wind className="w-6 h-6 mb-2 text-black" />
              <span className="text-xs opacity-80 mb-1">Viento</span>
              <span className="text-2xl font-bold">{datos?.clima?.[0]?.windSpeed !== undefined ? `${datos.clima[0].windSpeed} km/h` : 'N/A'}</span>
            </div>
            <HelpButton />
          </div>
        </div>
      </div>
      </>
    );
}

export default ClimaActual;