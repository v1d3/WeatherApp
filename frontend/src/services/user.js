import api from "../api/api";

// Sistema de caché global para datos del clima
const weatherCache = {
    data: null,
    timestamp: null,
    city: null,
    // Tiempo de validez de la caché en milisegundos (5 minutos)
    validityPeriod: 5 * 60 * 1000
};

// Función para verificar si la caché está vigente
const isCacheValid = (city = null) => {
    const now = Date.now();
    // Si no hay datos en caché o expiró, no es válida
    if (!weatherCache.data || !weatherCache.timestamp) return false;

    // Si se especifica una ciudad y es diferente a la almacenada, no es válida
    if (city && weatherCache.city !== city) return false;

    // Verificar si han pasado menos de 5 minutos desde la última actualización
    return now - weatherCache.timestamp < weatherCache.validityPeriod;
};

const getAuthTokenActivity = () => {
    const token = localStorage.getItem("activityToken");
    if (!token) throw new Error("No hay token de autenticación");
    return token;
};

const getWeatherData = async () => {
    try {
        const now = new Date();

        // Verificar si hay datos en caché válidos
        if (isCacheValid()) {
            console.log("Usando datos del clima en caché");
            return weatherCache.data;
        }

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
            console.log("Ubicación obtenida:", latitude, longitude);
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

        const result = {
            ciudad,
            clima: [adaptedWeatherData],  // Mantenemos el formato de array para compatibilidad
            fullForecast: responseForecast.data  // Guardar respuesta completa para uso en otras funciones
        };

        // Guardar en caché
        weatherCache.data = result;
        weatherCache.timestamp = Date.now();
        weatherCache.city = ciudad;

        return result;
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

        // Si no hay ciudad específica y hay datos en caché, usar los de caché
        if (!ciudad && isCacheValid()) {
            ciudad = weatherCache.city;
        }

        // Intentar obtener datos del clima, reutilizando la caché
        let weatherData;
        if (ciudad && ciudad === weatherCache.city && isCacheValid(ciudad)) {
            weatherData = weatherCache.data;
        } else {
            // Si no hay caché válida o la ciudad es diferente, buscar nuevos datos
            weatherData = await getWeatherDataByCity(ciudad || 'Santiago');
        }

        // Si no hay datos de pronóstico completo, tenemos que hacer una nueva llamada
        if (!weatherData.fullForecast) {
            console.log("No hay datos de pronóstico completo en caché, solicitando nuevos datos");
            weatherData = await getWeatherData();
        }

        // Crear un array para almacenar los datos horarios
        const hourlyData = [];

        // Obtener todos los pronósticos disponibles para hoy y mañana
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD formato

        // Crear una fecha para mañana
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Primero añadimos los pronósticos de hoy
        if (weatherData.fullForecast.dailyForecast[today] && weatherData.fullForecast.dailyForecast[today].hourlyForecasts) {
            const todayForecasts = Object.entries(weatherData.fullForecast.dailyForecast[today].hourlyForecasts)
                .map(([hour, forecast]) => ({
                    hour,
                    ...forecast,
                    dateObj: (() => {
                        const d = new Date(today);
                        const [h, m] = hour.split(':').map(Number);
                        d.setHours(h, m || 0, 0, 0);
                        return d;
                    })()
                }));

            // Añadir todos los pronósticos de hoy que son después de la hora actual
            const availableForecasts = todayForecasts.filter(f => f.dateObj >= now);

            // Añadir estos pronósticos al resultado
            availableForecasts.forEach(forecast => {
                if (hourlyData.length < hoursCount + 1) { // +1 porque incluimos la hora actual
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
            });
        }

        // Si no tenemos suficientes pronósticos, intentamos añadir los de mañana
        if (hourlyData.length < hoursCount + 1 &&
            weatherData.fullForecast.dailyForecast[tomorrowStr] &&
            weatherData.fullForecast.dailyForecast[tomorrowStr].hourlyForecasts) {

            const tomorrowForecasts = Object.entries(weatherData.fullForecast.dailyForecast[tomorrowStr].hourlyForecasts)
                .map(([hour, forecast]) => ({
                    hour,
                    ...forecast,
                    dateObj: (() => {
                        const d = new Date(tomorrowStr);
                        const [h, m] = hour.split(':').map(Number);
                        d.setHours(h, m || 0, 0, 0);
                        return d;
                    })()
                }))
                .sort((a, b) => a.dateObj - b.dateObj); // Ordenar cronológicamente

            // Añadir pronósticos de mañana hasta completar los necesarios
            for (const forecast of tomorrowForecasts) {
                if (hourlyData.length < hoursCount + 1) {
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
                } else {
                    break;
                }
            }
        }

        // Si aún no tenemos suficientes datos, completar con valores N/A
        // Esto solo debería ocurrir en casos muy excepcionales
        while (hourlyData.length < hoursCount + 1) {
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

        // Usar getWeatherData() para obtener datos del clima (de caché o nuevos)
        let weatherData = await getWeatherData();

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

// Modificar esta función para usar la caché
const getWeatherDataByCity = async (ciudad) => {
    try {
        // Verificar si hay datos en caché válidos para esta ciudad
        if (isCacheValid(ciudad)) {
            console.log(`Usando datos en caché para ${ciudad}`);
            return weatherCache.data;
        }

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

        const result = {
            ciudad,
            clima: [adaptedWeatherData],  // Mantenemos el formato de array para compatibilidad
            fullForecast: responseForecast.data  // Guardar respuesta completa para uso en otras funciones
        };

        // Guardar en caché
        weatherCache.data = result;
        weatherCache.timestamp = Date.now();
        weatherCache.city = ciudad;

        return result;
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

        // Usar getWeatherData() para obtener datos del clima (de caché o nuevos)
        let weatherData = await getWeatherData();

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
        // ERROR: Usando el token incorrecto
        // const token = localStorage.getItem('weatherToken');

        // ✅ CORRECCIÓN: Usar el token específico para actividades
        const token = localStorage.getItem('activityToken');

        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        // Verificar que activityId y newWeight sean válidos
        if (!activityId || activityId <= 0) {
            throw new Error('ID de actividad inválido');
        }

        // Resto del código igual...
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

export const modifyActivity = async (activityId, activityData) => {
    try {
        const token = getAuthTokenActivity();
        if (!token) throw new Error('No hay token de autenticación');

        const payload = {
            name: activityData.name,
            minTemperature: parseFloat(activityData.minTemperature),
            maxTemperature: parseFloat(activityData.maxTemperature),
            minHumidity: parseInt(activityData.minHumidity),
            maxHumidity: parseInt(activityData.maxHumidity),
            minWindSpeed: parseFloat(activityData.minWindSpeed),
            maxWindSpeed: parseFloat(activityData.maxWindSpeed),
            weatherIds: activityData.weatherIds,
            tagIds: activityData.tagIds // Añadir tagIds
        };

        const response = await api.put(
            `/activity/${activityId}`,
            payload,
            {
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

export const getAllActivities = async () => {
    try {
        const token = getAuthTokenActivity();
        const response = await api.get(`/activity`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Asegúrate de que el backend está devolviendo tags en cada actividad
        return response.data;
    } catch (error) {
        console.error("Error al obtener actividades:", error);
        throw new Error("Error al obtener actividades: " + error.message);
    }
};

export const getFilteredActivities = async () => {
    try {
        const token = localStorage.getItem('weatherToken');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        // Usar getWeatherData() para obtener datos del clima (de caché o nuevos)
        let weatherData = await getWeatherData();

        if (!weatherData.clima || weatherData.clima.length === 0) {
            throw new Error('No se encontraron datos meteorológicos actuales');
        }

        const currentWeather = weatherData.clima[0];
        console.log('Datos meteorológicos actuales para filtrado:', currentWeather);

        // Obtener actividades filtradas por condiciones climáticas actuales
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

        console.log('Pool de actividades recomendables:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al obtener pool de actividades:', error);
        throw new Error('Error al obtener actividades recomendables: ' + error.message);
    }
};

// Función para forzar una actualización de caché
const forceWeatherUpdate = async (ciudad = null) => {
    try {
        // Si se proporciona una ciudad, actualizamos para esa ciudad
        if (ciudad) {
            await getWeatherDataByCity(ciudad);
        } else {
            // De lo contrario, actualizamos para la ubicación actual
            await getWeatherData();
        }
        return true;
    } catch (error) {
        console.error("Error al forzar actualización del clima:", error);
        return false;
    }
};

export default {
    getWeatherData,
    getHourlyWeatherData,
    getWeatherDataByCity,
    getActivities,
    getAllActivities,
    getFilteredActivities,
    updateActivityWeight,
    modifyActivity,
    register,
    forceWeatherUpdate  // Exportar la función de actualización forzada
};

// const resultado = await getActivities();
// console.log('Datos completos de actividad recibidos:', JSON.stringify(resultado));

export const getScheduledActivities = async () => {
    try {
        const token = localStorage.getItem('calendarToken');
        if (!token) {
            console.log('No hay token de calendario disponible');
            return [];
        }

        // Extraer el ID de usuario del token
        const tokenPayload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(tokenPayload));
        const userId = decodedPayload.userId || decodedPayload.sub || decodedPayload.id;

        if (!userId) {
            console.warn('No se pudo identificar al usuario en el token');
            return [];
        }

        console.log(`Buscando actividades calendarizadas para el usuario ID: ${userId}`);

        // Obtener calendarios del usuario
        const response = await api.get(`/calendar`, {
            params: {
                username: userId
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Respuesta completa del servidor de calendarios:', response.data);

        // Verificar si hay datos y procesarlos
        if (response.data && Array.isArray(response.data)) {
            console.log(`Se encontraron ${response.data.length} actividades calendarizadas`);

            const now = new Date();
            now.setSeconds(0);
            now.setMilliseconds(0);
            const nowTime = now.getTime();

            // Obtener todas las actividades del usuario una sola vez
            let userActivities = [];
            try {
                const activityToken = localStorage.getItem('activityToken');
                if (activityToken) {
                    // Usar el endpoint correcto que obtiene actividades por usuario autenticado
                    const activityResponse = await api.get(`/activity`, {
                        headers: {
                            Authorization: `Bearer ${activityToken}`
                        }
                    });
                    userActivities = activityResponse.data;
                    console.log('Todas las actividades del usuario obtenidas:', userActivities);
                }
            } catch (error) {
                console.error('Error al obtener actividades del usuario:', error);
            }

            // Mapear los datos para obtener un formato adecuado
            const activities = [];
            
            for (const item of response.data) {
                const activityDate = new Date(item.timeInit);
                const minutesDiff = Math.abs(nowTime - activityDate.getTime()) / (60 * 1000);

                console.log(`=== PROCESANDO ACTIVIDAD ===`);
                console.log(`Nombre: ${item.activity?.name || 'Sin nombre'}`);
                console.log(`ID de actividad: ${item.activity?.id}`);
                console.log(`Fecha: ${activityDate}`);
                console.log(`Diferencia: ${minutesDiff.toFixed(1)} minutos`);

                // Buscar los datos completos de la actividad en las actividades del usuario
                let fullActivityData = null;
                if (item.activity?.id && userActivities.length > 0) {
                    fullActivityData = userActivities.find(act => act.id === item.activity.id);
                    if (fullActivityData) {
                        console.log('Datos completos de la actividad encontrados:', fullActivityData);
                    } else {
                        console.log('Actividad no encontrada en las actividades del usuario, usando datos del calendario');
                        fullActivityData = item.activity;
                    }
                } else {
                    // Si no hay ID o no hay actividades del usuario, usar los datos del calendario
                    fullActivityData = item.activity;
                }

                // Usar los datos completos si están disponibles, sino usar los del calendario
                const activityData = fullActivityData || item.activity || {};

                console.log('Datos finales de actividad a usar:', activityData);

                const mappedActivity = {
                    id: activityData.id || item.id,
                    name: activityData.name || 'Actividad programada',
                    timeInit: item.timeInit,
                    scheduledDate: item.timeInit,
                    // Datos climáticos completos
                    minTemperature: activityData.minTemperature,
                    maxTemperature: activityData.maxTemperature,
                    minHumidity: activityData.minHumidity,
                    maxHumidity: activityData.maxHumidity,
                    minWindSpeed: activityData.minWindSpeed,
                    maxWindSpeed: activityData.maxWindSpeed,
                    weight: activityData.weight || 1.0,
                    tags: Array.isArray(activityData.tags) ? activityData.tags : [],
                    weathers: Array.isArray(activityData.weathers) ? activityData.weathers : [],
                    // Información del calendario
                    calendarId: item.id,
                    userId: item.userEntity?.id,
                    // Información adicional
                    isDefault: activityData.isDefault || false,
                    wasCustomized: activityData.wasCustomized || false
                };

                console.log('=== ACTIVIDAD MAPEADA FINAL ===');
                console.log('Actividad final mapeada:', mappedActivity);
                console.log('================================');

                activities.push(mappedActivity);
            }

            return activities;
        } else {
            console.log('No se encontraron calendarios para el usuario');
            return [];
        }
    } catch (error) {
        console.error('Error al obtener actividades programadas:', error);
        if (error.response) {
            console.error('Detalles del error:', error.response.data);
            console.error('Estado HTTP:', error.response.status);
        }
        return [];
    }
};