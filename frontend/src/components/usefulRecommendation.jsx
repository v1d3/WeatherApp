import React, { useState, useEffect } from 'react';
import UserService from '../services/user';
import { getActivities } from '../services/user.js';
import api from "../api/api";

const UsefulRecommendation = ({ ciudadSeleccionada, activity}) => {
  const [suggestion, setSuggestion] = useState("Obteniendo datos necesarios...");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  
  useEffect(() => {
    if (!activity) {
    setIsLoading(true);
    setSuggestion("Esperando actividad...");
    return;
  }
  let isMounted = true;
  let fetchInProgress = false;
  const maxRetries = 3;
  const retryDelay = 2000;

  const fetchData = async () => {
    if(fetchInProgress) return;
    fetchInProgress = true;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtener datos del clima
      const weatherData = ciudadSeleccionada 
        ? await UserService.getWeatherDataByCity(ciudadSeleccionada)
        : await UserService.getWeatherData();

      if (!weatherData?.clima?.[0]) {
        throw new Error("Datos climáticos no disponibles");
      }
      const weather = weatherData.clima[0];

      // 2. Usar la actividad recibida o buscar una nueva
      let usedActivity = activity;
      if (!usedActivity) {
        usedActivity = await getActivities();
        if (!usedActivity) {
          throw new Error("No hay actividades recomendadas");
        }
      }

      // 3. Generar prompt y pedir recomendación
      const prompt = `
        Actividad recomendada: ${usedActivity.name}
        Condiciones meteorológicas:
        - Tipo: ${weather.weather?.name || 'No disponible'}
        - Temperatura: ${weather.temperature}°C
        - Humedad: ${weather.humidity}%
        - Viento: ${weather.windSpeed} km/h
        - Ubicación: ${ciudadSeleccionada || 'No disponible'}

        ¿Qué recomendaciones me darías para esta actividad con el clima actual?`;

      const token = localStorage.getItem('weatherToken');
      if(!token){
        throw new Error("No hay token de autenticación");
      }

      const response = await api.post('/chatbot/ask', 
        { question: prompt },  
        { headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } }
      );

      if (isMounted) {
        setCurrentActivity(usedActivity);
        setWeatherInfo(weather);
        setSuggestion(response?.data || "No se recibieron recomendaciones");
        setIsLoading(false);
      }
    } catch (error) {
      if (isMounted) {
        if (retryCount < maxRetries) {
          setTimeout(() => setRetryCount(c => c + 1), retryDelay);
        } else {
          setError(error.message);
          setSuggestion(`Error: ${error.message}`);
          setIsLoading(false);
        }
      }
    } finally {
      fetchInProgress = false;
    }
  };

  fetchData();

  return () => { isMounted = false; };
}, [ciudadSeleccionada, activity, retryCount]);

  return (
  <div style={{ height: '100%' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div
        style={{
          background: 'linear-gradient(to right, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid rgba(34, 211, 238, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(34, 211, 238, 0.2)',
              borderRadius: '0.25rem',
              padding: '0.25rem'
            }}
          >
            
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: 'white',
                fontWeight: '500',
                fontSize: '0.75rem',
                marginBottom: '0.25rem'
              }}
            >
              {isLoading
                ? 'Cargando...'
                : error
                ? 'Error'
                : currentActivity?.name || 'Actividad no disponible'}
              {isLoading && retryCount > 0 && (
                <span style={{ marginLeft: '0.5rem', fontWeight: '400' }}>
                  (Intento {retryCount})
                </span>
              )}
            </div>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem',
                lineHeight: '1.4',
              }}
            >
              {isLoading ? (
                'Obteniendo sugerencia...'
              ) : error ? (
                <span style={{ color: '#ef4444' }}>{suggestion}</span>
              ) : (
                suggestion.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default UsefulRecommendation;