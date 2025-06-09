import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/HelpButton.module.css';
import UserService from '../services/user';
import api from "../api/api"

const HelpButton = ({ ciudadSeleccionada }) => {
  const [visible, setVisible] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  const fetchWeatherExplanation = async () => {
    setIsLoading(true);
    setExplanation("Analizando datos meteorológicos...");
    
    try {
      
      const weatherData = ciudadSeleccionada 
        ? await UserService.getWeatherDataByCity(ciudadSeleccionada)
        : await UserService.getWeatherData();

      console.log("Datos del clima:", weatherData); // Debug

      if (!weatherData?.clima?.[0]) {
        throw new Error("Datos meteorológicos incompletos");
      }

      
      const currentWeather = weatherData.clima[0];
      const prompt = `
        - Tipo: ${currentWeather.weather?.name || 'No disponible'}
        - Temperatura: ${currentWeather.temperature}°C
        - Humedad: ${currentWeather.humidity}%
        - Viento: ${currentWeather.windSpeed} km/h
        - Ubicación: ${weatherData.ciudad || 'No disponible'}`;

      const token = localStorage.getItem('weatherToken');
      if(!token){
        throw new Error("No hay token de autenticación");
      }
      
      console.log("Prompt enviado al backend:", prompt);

      console.log("Payload a enviar:", { question: prompt }); 
      console.log("Objeto a enviar:", { question: prompt.trim() });
      
      const response = await api.post('/chatbot/ask', 
      { question: prompt },  
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
      
      if (!response.data) {
        throw new Error("Respuesta del chatbot vacía");
      }

      setExplanation(response.data);
    } catch (error) {
      console.error("Error completo:", error);
      setExplanation(`⚠️ Error: ${error.message || 'Intenta nuevamente más tarde'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    const newVisibility = !visible;
    setVisible(newVisibility);
    
    if (newVisibility) {
      fetchWeatherExplanation();
    }
  };
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);

  return (
    <div className={styles.container}>
      <button
        ref={buttonRef}
        className={styles.helpButton}
        onClick={handleButtonClick}
        disabled={isLoading}
        aria-label="Explicación meteorológica"
      >
        {isLoading ? '...' : '?'}
      </button>
      {visible && (
        <div ref={tooltipRef} className={styles.explanationBox}>
          {explanation || "Cargando explicación..."}
        </div>
      )}
    </div>
  );
};

export default HelpButton;