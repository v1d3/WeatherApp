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
      if (!token) throw new Error("No autenticado");

      const response = await api.post('/chatbot/ask', 
        { question: prompt },  
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/30">
          <div className="flex items-start space-x-3">
            <div>
              <div className="text-black/70 text-xs mt-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">Cargando...</span>
                    {retryCount > 0 && <span>(Intento {retryCount})</span>}
                  </div>
                ) : error ? (
                  <span className="text-red-500/80">{suggestion}</span>
                ) : (
                  <>
                    <p className="font-semibold">{currentActivity?.name || 'Actividad'}</p>
                    <p>{suggestion}</p>
                  </>
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