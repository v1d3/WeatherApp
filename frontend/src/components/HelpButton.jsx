import React, { useState, useRef, useEffect } from 'react';
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
    <div className="position-relative d-inline-block">
      <button
        ref={buttonRef}
        className="btn btn-outline-light rounded-circle p-2"
        onClick={handleButtonClick}
        disabled={isLoading}
        aria-label="Explicación meteorológica"
        style={{
          width: '2.5rem',
          height: '2.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
      >
        {isLoading ? '...' : '?'}
      </button>
      {visible && (
        <div
          ref={tooltipRef}
          className="position-absolute start-50 translate-middle-x mt-2 bg-white bg-opacity-90 text-dark rounded shadow-lg p-3 small"
          style={{
            zIndex: 50,
            width: '16rem',
            borderRadius: '0.75rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {explanation || "Cargando explicación..."}
        </div>
      )}
    </div>
  );
};

export default HelpButton;