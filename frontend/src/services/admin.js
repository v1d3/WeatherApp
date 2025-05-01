import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

const getAuthToken = () => {
    const token = localStorage.getItem('weatherToken');
    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    console.log('Token de autenticación:', token);
    return token;
};

export const weatherService = {
    saveWeather: async (weatherData) => {
        console.log('Datos del clima a guardar:', weatherData);
        try {
            const token = getAuthToken();

            let weatherId;
            try {
                if (!weatherData.weatherId && weatherData.weatherId !== 0) {
                    throw new Error('El ID del clima es requerido');
                }

                weatherId = parseInt(weatherData.weatherId);
                if (isNaN(weatherId)) {
                    throw new Error('El ID del clima debe ser un número');
                }
                console.log('ID del clima:', weatherId);
            } catch (e) {
                throw new Error('ID del clima no válido: ' + e.message);
            }

            let formattedDate;
            try {
                const dateObj = new Date(weatherData.dateTime);
                if (isNaN(dateObj.getTime())) {
                    throw new Error('Fecha no válida');
                }
                formattedDate = dateObj.toISOString();
            } catch (e) {
                throw new Error('Error en formato de fecha: ' + e.message);
            }

            if (!weatherData.location.trim()) {
                throw new Error('La ubicación no puede estar vacía');
            }

            const payload = {
                weatherId: weatherId,
                dateTime: formattedDate,
                location: weatherData.location,
                temperature: parseFloat(weatherData.temperature),
                humidity: parseInt(weatherData.humidity),
                windSpeed: parseFloat(weatherData.windSpeed)
            };

            console.log('Sending payload to backend:', payload);
            console.log('API URL:', `${API_URL}/weather-data`);

            try {
                const response = await axios.post(`${API_URL}/weather-data`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error al guardar el clima:', error);

                if (error.response) {
                    console.error('Respuesta del servidor:', error.response.data);
                    console.error('Código de estado:', error.response.status);
                    console.error('Cabeceras:', error.response.headers);
                } else if (error.request) {
                    console.error('Sin respuesta del servidor:', error.request);
                }

                throw new Error(`Error al guardar el clima: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al guardar el clima:', error);
            throw new Error(`Error al guardar el clima: ${error.message}`);
        }
    },

    getWeatherNames: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/weather`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.map(weather => weather.name);
        } catch (error) {
            console.error('Error al obtener nombres del clima:', error);
            throw new Error('Error al obtener nombres del clima: ' + error.message);
        }
    }
};