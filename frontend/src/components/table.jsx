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
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full md:w-[80%] mx-auto my-8 px-4">
    {cargando ? (
      <div className="col-span-full text-center text-white/60">Cargando...</div>
    ) : error ? (
      <div className="col-span-full text-center text-red-500">{error}</div>
    ) : datos && datos.length > 0 ? (
      datos.slice(0, 5).map((item, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center hover:bg-white/15 transition-all duration-300"
        >
          <div className="text-white/80 text-sm mb-2">
            {item ? formatToChileanTime(item.dateTime) : 'N/A'}
            <span className="ml-1">
              <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" />
            </span>
          </div>

          <div className="flex justify-center mb-3">
            <span className="mr-1">
              <FontAwesomeIcon icon={faTemperatureThreeQuarters} color="#5dade2" className="w-8 h-8" />
            </span>
            {item && item.temperature !== 'N/A' ? `${item.temperature}°C` : 'N/A'}
          </div>

          <div className="text-white/60 text-xs mb-2">
            <span className="mr-1">
              <FontAwesomeIcon icon={faPercent} color="#5dade2" />
            </span>
            {item && item.humidity !== 'N/A' ? `${item.humidity}%` : 'N/A'}
          </div>

          <div className="text-white/60 text-xs">
            <span className="mr-1">
              <FontAwesomeIcon icon={faWind} color="#5dade2" />
            </span>
            {item && item.windSpeed !== 'N/A' ? `${item.windSpeed} km/h` : 'N/A'}
          </div>
        </div>
      ))
    ) : (
      <div className="col-span-full text-center text-white/60">No hay datos disponibles</div>
    )}
  </div>
);

}

export default Table;
