import axios from 'axios';

export const getWeatherData = async () => {
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