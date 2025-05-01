import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

const getAuthTokenWeather = () => {
    const token = localStorage.getItem('weatherToken');
    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    console.log('Token de autenticación:', token);
    return token;
};

const getAuthTokenActivity = () => {
    const token = localStorage.getItem('activityToken');
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
            const token = getAuthTokenWeather();

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
            const token = getAuthTokenWeather();
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

export const activityService = {
    saveActivity: async (activityData) => {
        console.log('Datos del clima a guardar:', activityData);
        try {
            const token = getAuthTokenActivity();

            let activityId;
            try {
                if (!activityData.name && activityData.name !== "") {
                    throw new Error('El nombre de la actividad es requerido');
                }

                activityId = String(activityData.name);
                if (!isNaN(activityId)) {
                    throw new Error('El nombre de la actividad debe ser un texto');
                }
                console.log('Nombre de la actividad:', activityId);
            } catch (e) {
                throw new Error('Nombre de la actividad no válido: ' + e.message);
            }


            const payload = {
                name: activityId,
                minTemperature: parseFloat(activityData.minTempValue),
                maxTemperature: parseFloat(activityData.maxTempValue),
                minHumidity: parseFloat(activityData.minHumValue),
                maxHumidity: parseFloat(activityData.maxHumValue),
                minWindSpeed: parseFloat(activityData.minWindValue),
                maxWindSpeed: parseFloat(activityData.maxWindValue)
            };

            console.log('Sending payload to backend:', payload);
            console.log('API URL:', `${API_URL}/activity`);

            try {
                const response = await axios.post(`${API_URL}/activity`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error al guardar la actividad:', error);

                if (error.response) {
                    console.error('Respuesta del servidor:', error.response.data);
                    console.error('Código de estado:', error.response.status);
                    console.error('Cabeceras:', error.response.headers);
                } else if (error.request) {
                    console.error('Sin respuesta del servidor:', error.request);
                }

                throw new Error(`Error al guardar la actividad: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al guardar la actividad:', error);
            throw new Error(`Error al guardar la actividad: ${error.message}`);
        }
    },

    getActivityNames: async () => {
        try {
            const token = getAuthTokenActivity();
            const response = await axios.get(`${API_URL}/activity`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.map(activity => activity.name);
        } catch (error) {
            console.error('Error al obtener nombres de la actividad:', error);
            throw new Error('Error al obtener nombres de la actividad: ' + error.message);
        }
    }
};