import axios from 'axios';

export const getWeatherData = async () => {
    try {
        // Obtener la fecha y hora actual
        const fechaActual = new Date();
        const fechaChile = fechaActual.toLocaleString('en-US', {
            timeZone: 'America/Santiago',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const [date, time] = fechaChile.split(', ');
        const [month, day, year] = date.split('/');
        const fechaISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}:00.032Z`;

        // Obtener la ubicación
        const position = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject)
        );

        const { latitude, longitude } = position.coords;

        const responseGeo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const dataGeo = await responseGeo.json();
        const ciudad = dataGeo.address.city || dataGeo.address.town || dataGeo.address.village || 'Desconocida';

        // Obtener datos del clima
        const responseWeather = await axios.get('http://localhost:8080/api/v1/weather-data', {
            params: {
                location: ciudad,
                dateTime: fechaISO
            },
            headers: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNzQ1OTQ5NDIxLCJleHAiOjE3NDYwMzU4MjF9.jt5Z6rCXaEE_5fZZBFxPaTG_cKbeIjKtvBeYlvYVdLc'
            }
        });

        console.log('Fecha actual:', fechaISO);
        console.log('Ciudad:', ciudad);
        return responseWeather.data;
    } catch (error) {
        console.error('Error al obtener los datos del clima:', error);
        throw error;
    }
};