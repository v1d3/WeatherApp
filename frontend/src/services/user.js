import axios from 'axios';

const getWeatherData = async () => {
    try {
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        const fechaISO = now.toISOString();

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

        let ciudad = 'Desconocida';
        try {
            const responseGeo = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!responseGeo.ok) {
                throw new Error(`Error del servicio de geolocalización: ${responseGeo.status}`);
            }

            const dataGeo = await responseGeo.json();
            if (dataGeo && dataGeo.address) {
                ciudad = dataGeo.address.city || dataGeo.address.town || dataGeo.address.village || 'Desconocida';
            }
        } catch (geoApiError) {
            console.warn("Error al obtener nombre de la ciudad:", geoApiError);
            // Continuamos con ciudad='Desconocida'
        }

        // Obtener datos del clima
        const responseWeather = await axios.get('http://localhost:8080/api/v1/weather-data', {
            params: {
                location: ciudad,
                dateTime: fechaISO
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Fecha actual:', fechaISO);
        console.log('Ciudad:', ciudad);
        return {
            ciudad,
            clima: responseWeather.data
        };
    } catch (error) {
        console.error("Error completo:", error);
        throw new Error('Error al obtener datos del clima: ' + error.message);
    }
};

const getHourlyWeatherData = async (hoursCount = 4) => {
    try {
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

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

        let ciudad = 'Desconocida';
        try {
            const responseGeo = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!responseGeo.ok) {
                throw new Error(`Error del servicio de geolocalización: ${responseGeo.status}`);
            }

            const dataGeo = await responseGeo.json();
            if (dataGeo && dataGeo.address) {
                ciudad = dataGeo.address.city || dataGeo.address.town || dataGeo.address.village || 'Desconocida';
            }
        } catch (geoApiError) {
            console.warn("Error al obtener nombre de la ciudad:", geoApiError);
            // Continuamos con ciudad='Desconocida'
        }

        // Crear un array para almacenar los datos horarios
        const hourlyData = [];
        
        // Obtener datos para la hora actual y las siguientes horas (total: hoursCount + 1)
        for (let i = 0; i <= hoursCount; i++) {
            const hourTime = new Date(now);
            hourTime.setHours(now.getHours() + i);
            const hourTimeISO = hourTime.toISOString();
            
            try {
                // Obtener datos meteorológicos para cada hora
                const responseWeather = await axios.get('http://localhost:8080/api/v1/weather-data', {
                    params: {
                        location: ciudad,
                        dateTime: hourTimeISO
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Si hay datos disponibles, añadirlos al array
                if (responseWeather.data && responseWeather.data.length > 0) {
                    hourlyData.push(responseWeather.data[0]);
                } else {
                    // Si no hay datos, añadir un objeto con N/A para esa hora
                    hourlyData.push({
                        dateTime: hourTimeISO,
                        temperature: 'N/A',
                        humidity: 'N/A',
                        windSpeed: 'N/A',
                        location: ciudad
                    });
                }
            } catch (error) {
                console.warn(`Error al obtener datos para la hora ${hourTimeISO}:`, error);
                // Añadir un objeto con N/A para esta hora
                hourlyData.push({
                    dateTime: hourTimeISO,
                    temperature: 'N/A',
                    humidity: 'N/A',
                    windSpeed: 'N/A',
                    location: ciudad
                });
            }
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

        const weatherData = await getWeatherData();

        if (!weatherData || weatherData.length === 0) {
            throw new Error('No se encontraron datos meteorológicos actuales');
        }

        const currentWeather = weatherData[0];

        console.log('Datos meteorológicos actuales:', currentWeather);

        const response = await axios.get('http://localhost:8080/api/v1/activity', {
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
        const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
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
        else{
            console.error("Error en el registro:", error);
            throw new Error("Error al registrar, intenta nuevamente más tarde");
        }
    }
}

export default { getWeatherData, getHourlyWeatherData, getActivities, register };