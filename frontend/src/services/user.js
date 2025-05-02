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
        return responseWeather.data;
    } catch (error) {
        console.error("Error completo:", error);
        throw new Error('Error al obtener datos del clima: ' + error.message);
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

export default { getWeatherData, getActivities, register };