import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/HelpButton.module.css';
import UserService from '../services/user';

const HelpButton = () => {
  const [visible, setVisible] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  const fetchWeatherExplanation = async () => {
    setIsLoading(true);
    setExplanation("Analizando datos meteorológicos...");
    
    try {

      const weatherData = await UserService.getWeatherData();

      console.log("Datos recibidos de UserService:", weatherData);

      if (!weatherData || !weatherData.clima || !weatherData.clima[0]) {
        console.error("Estructura inesperada:", {
        hasWeatherData: !!weatherData,
        hasClima: weatherData?.clima,
        hasFirstItem: weatherData?.clima?.[0]
      });
        throw new Error("Datos meteorológicos no disponibles");

      }

      const currentWeather = weatherData.clima[0];
      const prompt = ` 
        - Tipo: ${currentWeather.weather?.name || 'No disponible'}
        - Temperatura: ${currentWeather.temperature}°C
        - Humedad: ${currentWeather.humidity}%
        - Viento: ${currentWeather.windSpeed} km/h
        - Ubicación: ${weatherData.ciudad || 'No disponible'}`;

      const response = await fetch('http://localhost:8080/api/v1/chatbot/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', response.status, errorData);
        throw new Error(`Error ${response.status}: ${errorData.message || 'Sin detalles'}`);
      }

      const data = await response.json();
      setExplanation(data.answer || data);
    } catch (error) {
      console.error("Error completo:", error);
      setExplanation("⚠️ No se pudo generar la explicación. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!visible) {
      fetchWeatherExplanation();
    }
    setVisible(!visible);
  };

  // Manejo de clicks fuera (igual que antes)
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