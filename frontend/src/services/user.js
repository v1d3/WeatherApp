import api from "../api/api";

const getWeatherData = async () => {
    try {
        const now = new Date();

        let latitude, longitude;
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve,
                    (error) => reject(new Error(`Error de geolocalización: ${error.message}`)),
                    { timeout: 10000 }
                );
            });

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        } catch (geoError) {
            console.error("Error al obtener la ubicación:", geoError);
            throw new Error("No se pudo obtener tu ubicación. " + geoError.message);
        }

        const token = localStorage.getItem('weatherToken');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        let ciudad = 'Santiago'; // Valor predeterminado
        try {
            const responseGeo = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!responseGeo.ok) {
                throw new Error(`Error del servicio de geolocalización: ${responseGeo.status}`);
            }

            const dataGeo = await responseGeo.json();
            if (dataGeo && dataGeo.address) {
                ciudad = dataGeo.address.city || dataGeo.address.town || dataGeo.address.village || 'Santiago';
            }
        } catch (geoApiError) {
            console.warn("Error al obtener nombre de la ciudad:", geoApiError);
        }

        // Obtener pronóstico usando la API de forecast
        const responseForecast = await api.get('/forecast/city', {
            params: {
                name: ciudad
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Pronóstico completo recibido:', responseForecast.data);

        // Procesar la respuesta para mantener compatibilidad con el resto de la app
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formato
        const todayForecast = responseForecast.data.dailyForecast[today];

        if (!todayForecast) {
            throw new Error('No se encontraron datos meteorológicos para hoy');
        }

        // Obtener la hora actual
        const currentHour = now.getHours();

        // Buscar el pronóstico más cercano a la hora actual
        let closestForecast = null;
        let minTimeDiff = Infinity;

        Object.entries(todayForecast.hourlyForecasts).forEach(([hour, forecast]) => {
            const forecastHour = parseInt(hour.split(':')[0]);
            const timeDiff = Math.abs(forecastHour - currentHour);

            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                closestForecast = forecast;
            }
        });

        // Usar el pronóstico más cercano a la hora actual en lugar del primaryWeather
        const currentWeather = closestForecast || todayForecast.primaryWeather ||
            Object.values(todayForecast.hourlyForecasts)[0];

        const adaptedWeatherData = {
            dateTime: currentWeather.timestampUTC,
            temperature: currentWeather.temperature,
            humidity: currentWeather.humidity,
            windSpeed: currentWeather.windSpeed,
            weather: {
                // Usar la versión mapeada si está disponible
                id: currentWeather.dbWeatherId || null,
                name: currentWeather.dbWeatherName || currentWeather.weather,
                description: currentWeather.description,
                icon: currentWeather.icon || "09d"
            },
            location: ciudad
        };

        return {
            ciudad,
            clima: [adaptedWeatherData]  // Mantenemos el formato de array para compatibilidad
        };
    } catch (error) {
        console.error("Error completo:", error);
        throw new Error('Error al obtener datos del clima: ' + error.message);
    }
};

const getHourlyWeatherData = async (hoursCount = 4, customCiudad = null) => {
    try {
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        let ciudad = customCiudad;
        const token = localStorage.getItem('weatherToken');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        // Solo obtener ubicación si no se proporciona una ciudad
        if (!ciudad) {
            let latitude, longitude;
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve,
                        (error) => reject(new Error(`Error de geolocalización: ${error.message}`)),
                        { timeout: 10000 }
                    );
                });

                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

                // Obtener nombre de ciudad por geolocalización
                try {
                    const responseGeo = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    if (!responseGeo.ok) {
                        throw new Error(`Error del servicio de geolocalización: ${responseGeo.status}`);
                    }

                    const dataGeo = await responseGeo.json();
                    if (dataGeo && dataGeo.address) {
                        ciudad = dataGeo.address.city || dataGeo.address.town || dataGeo.address.village || 'Santiago';
                    }
                } catch (geoApiError) {
                    console.warn("Error al obtener nombre de la ciudad:", geoApiError);
                    ciudad = 'Santiago'; // Ciudad por defecto
                }
            } catch (geoError) {
                console.error("Error al obtener la ubicación:", geoError);
                ciudad = 'Santiago'; // Ciudad por defecto si falla la geolocalización
            }
        }

        console.log('Obteniendo pronóstico por horas para:', ciudad);

        // Obtener pronóstico usando la API de forecast
        const responseForecast = await api.get('/forecast/city', {
            params: {
                name: ciudad
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Pronóstico completo recibido:', responseForecast.data);

        // Crear un array para almacenar los datos horarios
        const hourlyData = [];
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD formato

        const todayForecast = responseForecast.data.dailyForecast[today];
        if (!todayForecast || !todayForecast.hourlyForecasts) {
            throw new Error('No se encontraron pronósticos por hora para hoy');
        }

        // Convertir el mapa de pronósticos horarios a un array
        const hourForecasts = Object.entries(todayForecast.hourlyForecasts)
            .map(([hour, forecast]) => ({
                hour,
                ...forecast
            }))
            .sort((a, b) => {
                // Ordenar por hora
                const hourA = parseInt(a.hour.split(':')[0]);
                const hourB = parseInt(b.hour.split(':')[0]);
                return hourA - hourB;
            });

        // Encontrar el índice de la hora actual o la más cercana
        const currentHour = now.getHours();
        let startIndex = 0;
        for (let i = 0; i < hourForecasts.length; i++) {
            const forecastHour = parseInt(hourForecasts[i].hour.split(':')[0]);
            if (forecastHour >= currentHour) {
                startIndex = i;
                break;
            }
        }

        // Tomar la hora actual y las siguientes (hasta hoursCount)
        for (let i = 0; i <= hoursCount && (startIndex + i) < hourForecasts.length; i++) {
            const forecast = hourForecasts[startIndex + i];

            // Adaptar el formato para mantener compatibilidad
            hourlyData.push({
                dateTime: forecast.timestampUTC,
                temperature: forecast.temperature,
                humidity: forecast.humidity,
                windSpeed: forecast.windSpeed,
                weather: {
                    name: forecast.weather,
                    description: forecast.description,
                    icon: forecast.icon
                },
                location: ciudad
            });
        }

        // Si no hay suficientes horas en el día actual, completar con N/A
        while (hourlyData.length <= hoursCount) {
            const placeholderDate = new Date(now);
            placeholderDate.setHours(now.getHours() + hourlyData.length);

            hourlyData.push({
                dateTime: placeholderDate.toISOString(),
                temperature: 'N/A',
                humidity: 'N/A',
                windSpeed: 'N/A',
                location: ciudad
            });
        }

        console.log('Datos horarios obtenidos:', hourlyData);
        return hourlyData;
    } catch (error) {
        console.error("Error completo al obtener datos horarios:", error);
        throw new Error('Error al obtener datos horarios del clima: ' + error.message);
    }
};

export const getActivities = async () => {
    try {
        const token = localStorage.getItem('weatherToken');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        let weatherData;
        try {
            weatherData = await getWeatherData();
        } catch (error) {
            console.error("Error al obtener datos del clima:", error);
        }
        console.log(weatherData);

        if (!weatherData.clima || weatherData.clima.length === 0) {
            throw new Error('No se encontraron datos meteorológicos actuales');
        }

        const currentWeather = weatherData.clima[0];

        console.log('Datos meteorológicos actuales:', currentWeather);

        const response = await api.get('/activity', {
            params: {
                temperature: currentWeather.temperature,
                humidity: currentWeather.humidity,
                windSpeed: currentWeather.windSpeed,
                weatherName: currentWeather.weather?.name
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Actividades recomendadas:', response.data);

        // Si hay actividades disponibles, seleccionar una al azar
        if (response.data.length > 0) {
            const randomIndex = Math.floor(Math.random() * response.data.length);
            return response.data[randomIndex];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        throw new Error('Error al obtener actividades: ' + error.message);
    }
};


const register = async (username, password) => {
    try {
        const response = await api.post('/auth/register', {
            username,
            password
        });
        console.log("Registro exitoso:", response.data);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data == "Username already exists") {
            console.error("Error en el registro:", error.response.data);
            throw new Error("El usuario ya existe");
        }
        else {
            console.error("Error en el registro:", error);
            throw new Error("Error al registrar, intenta nuevamente más tarde");
        }
    }
}

// Añadir esta nueva función
const getWeatherDataByCity = async (ciudad) => {
    try {
        const token = localStorage.getItem('weatherToken');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        // Obtener pronóstico usando la API de forecast por nombre de ciudad
        const responseForecast = await api.get('/forecast/city', {
            params: {
                name: ciudad
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Pronóstico completo recibido:', responseForecast.data);

        // Procesar la respuesta para mantener compatibilidad con el resto de la app
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formato
        const todayForecast = responseForecast.data.dailyForecast[today];

        if (!todayForecast) {
            throw new Error('No se encontraron datos meteorológicos para hoy');
        }

        // Obtener el clima principal de hoy o el primer dato horario disponible
        const currentWeather = todayForecast.primaryWeather ||
            Object.values(todayForecast.hourlyForecasts)[0];

        // Adaptar el formato para mantener compatibilidad con el resto de la aplicación
        const adaptedWeatherData = {
            dateTime: currentWeather.timestampUTC,
            temperature: currentWeather.temperature,
            humidity: currentWeather.humidity,
            windSpeed: currentWeather.windSpeed,
            weather: {
                // Usar la versión mapeada si está disponible
                id: currentWeather.dbWeatherId || null,
                name: currentWeather.dbWeatherName || currentWeather.weather,
                description: currentWeather.description,
                icon: currentWeather.icon || "09d"
            },
            location: ciudad
        };

        return {
            ciudad,
            clima: [adaptedWeatherData]  // Mantenemos el formato de array para compatibilidad
        };
    } catch (error) {
        console.error("Error al obtener datos por ciudad:", error);
        throw new Error('Error al obtener datos del clima: ' + error.message);
    }
};

export const getRandomActivity = async () => {
    try {
        const token = localStorage.getItem('weatherToken');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        let weatherData;
        try {
            weatherData = await getWeatherData();
        } catch (error) {
            console.error("Error al obtener datos del clima:", error);
        }

        if (!weatherData.clima || weatherData.clima.length === 0) {
            throw new Error('No se encontraron datos meteorológicos actuales');
        }

        const currentWeather = weatherData.clima[0];

        console.log('Datos meteorológicos actuales:', currentWeather);

        const response = await api.get('/activity/random', {
            params: {
                temperature: currentWeather.temperature,
                humidity: currentWeather.humidity,
                windSpeed: currentWeather.windSpeed,
                weatherName: currentWeather.weather?.name
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Actividad recomendada:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al obtener actividad aleatoria:', error);
        throw new Error('Error al obtener actividad aleatoria: ' + error.message);
    }
};

export const updateActivityWeight = async (activityId, newWeight) => {
    try {
        const token = localStorage.getItem('weatherToken');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        // Verificar que activityId y newWeight sean válidos
        if (!activityId || activityId <= 0) {
            throw new Error('ID de actividad inválido');
        }

        // Verificación más flexible del peso
        let peso = newWeight;
        // Si es undefined o null, usar valor por defecto
        if (peso === undefined || peso === null) {
            console.warn('Peso indefinido, usando valor por defecto: 1.0');
            peso = 1.0;
        }

        // Intentar convertir a número si es string
        if (typeof peso === 'string') {
            peso = parseFloat(peso);
        }

        // Verificar si es un número válido después de la conversión
        if (isNaN(peso)) {
            throw new Error(`Peso inválido: ${newWeight} (convertido a ${peso})`);
        }

        // Limitar el valor
        const limitedWeight = Math.max(0.1, Math.min(parseFloat(peso), 10.0));

        console.log(`Actualizando peso para actividad ${activityId}: ${limitedWeight}`);

        const response = await api.put(`/activity/weight/${activityId}`,
            { weight: limitedWeight },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Peso de actividad actualizado:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar peso de actividad:', error);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
            console.error('Código de estado:', error.response.status);
        }
        throw new Error('Error al actualizar la valoración: ' + error.message);
    }
};

export const modifyActivity = async (activityId, newWeight) => {
    try {
        const token = localStorage.getItem('weatherToken');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        // Verificar que activityId y newWeight sean válidos
        if (!activityId || activityId <= 0) {
            throw new Error('ID de actividad inválido');
        }

        // Verificación del peso
        let peso = newWeight;
        // Si es undefined o null, usar valor por defecto
        if (peso === undefined || peso === null) {
            console.warn('Peso indefinido, usando valor por defecto: 1.0');
            peso = 1.0;
        }

        // Intentar convertir a número si es string
        if (typeof peso === 'string') {
            peso = parseFloat(peso);
        }

        // Verificar si es un número válido después de la conversión
        if (isNaN(peso)) {
            throw new Error(`Peso inválido: ${newWeight} (convertido a ${peso})`);
        }

        // Limitar el valor
        const limitedWeight = Math.max(0.1, Math.min(parseFloat(peso), 10.0));

        console.log(`Modificando actividad ${activityId} con nuevo peso: ${limitedWeight}`);

        // La API determinará si es default o no basándose en el ID
        const response = await api.put(`/activity/${activityId}`,
            { weight: limitedWeight },
            {
                params: {
                    // No necesitamos especificar isDefault, el backend lo determinará
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Actividad modificada:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al modificar actividad:', error);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
            console.error('Código de estado:', error.response.status);
        }
        throw new Error('Error al modificar la actividad: ' + error.message);
    }
};

export default {
    getWeatherData,
    getHourlyWeatherData,
    getWeatherDataByCity,
    getActivities,
    updateActivityWeight,
    modifyActivity,
    register
};

// const resultado = await getActivities();
// console.log('Datos completos de actividad recibidos:', JSON.stringify(resultado));