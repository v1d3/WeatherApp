import React, { useState, useEffect } from 'react';
import { weatherService } from '../services/admin';
import '../App.css';
import { useNavigate } from 'react-router-dom';

function Admin() {
    const [weatherNames, setWeatherNames] = useState([]);
    const [formData, setFormData] = useState({
        weatherId: '', // Inicialmente vacío pero será seleccionado por el usuario
        dateTime: '',
        location: '',
        temperature: '',
        humidity: '',
        windSpeed: ''
    });

    const navigate = useNavigate();

    const logOut = () => {
        localStorage.removeItem('UserLoged');
        navigate('/login');
    };

    useEffect(() => {
        const fetchWeatherNames = async () => {
            try {
                const names = await weatherService.getWeatherNames();
                setWeatherNames(names);
            } catch (error) {
                console.error('Error al cargar nombres del clima:', error);
                alert(error.message);
            }
        };
        fetchWeatherNames();
    }, []);

    const handleWeatherChange = (e) => {
        const selectedWeatherId = Number(e.target.value); // Convertir explícitamente a número

        setFormData({
            ...formData,
            weatherId: selectedWeatherId
        });

        console.log('Weather ID seleccionado:', selectedWeatherId, typeof selectedWeatherId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { weatherId, dateTime, location, temperature, humidity, windSpeed } = formData;

            if (!weatherId || !dateTime || !location || !humidity || !windSpeed || !temperature) {
                throw new Error('Por favor complete todos los campos');
            }

            const humValue = parseInt(humidity);
            if (humValue < 0 || humValue > 100) {
                throw new Error('La humedad debe estar entre 0 y 100%');
            }

            const tempValue = parseFloat(temperature);
            if (tempValue < -50 || tempValue > 50) {
                throw new Error('La temperatura debe estar entre -50°C y 50°C');
            }

            const windValue = parseFloat(windSpeed);
            if (windValue < 0 || windValue > 200) {
                throw new Error('La velocidad del viento debe estar entre 0 y 200 km/h');
            }

            await weatherService.saveWeather({
                weatherId,
                dateTime,
                location,
                temperature: tempValue,
                humidity: humValue,
                windSpeed: windValue
            });

            alert('Datos guardados exitosamente');

            setFormData({
                weatherId: '',
                dateTime: '',
                location: '',
                temperature: '',
                humidity: '',
                windSpeed: ''
            });
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    return (
        <div>
            <h1>Panel de Administración</h1>

            <form className="formulario" onSubmit={handleSubmit}>

                <ul className='Lista_de_formulario'>
                    <li>
                        <label htmlFor="weatherId" style={{ marginRight: "50px" }}>Clima:</label>
                        <select
                            id='weatherId'
                            name='weatherId'
                            value={formData.weatherId}
                            onChange={handleWeatherChange}
                            required
                        >
                            <option value="">Seleccione un clima</option>
                            {weatherNames.map((name, index) => (
                                <option key={index} value={index + 1}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </li>
                    <li>
                        <label htmlFor="temperature" style={{ marginRight: "50px" }}>Temperatura (°C):</label>
                        <input
                            id='temperature'
                            name='temperature'
                            type="number"
                            step="0.1"
                            value={formData.temperature}
                            onChange={handleInputChange}
                            placeholder="Ej: 25.5"
                        />
                    </li>
                    <li>
                        <label htmlFor="humidity" style={{ marginRight: "50px" }}>Humedad (%):</label>
                        <input
                            id='humidity'
                            name='humidity'
                            type="number"
                            min="0"
                            max="100"
                            value={formData.humidity}
                            onChange={handleInputChange}
                            placeholder="Ej: 75"
                        />
                    </li>
                    <li>
                        <label htmlFor="windSpeed" style={{ marginRight: "50px" }}>Velocidad del viento (km/h):</label>
                        <input
                            id='windSpeed'
                            name='windSpeed'
                            type="number"
                            step="0.1"
                            value={formData.windSpeed}
                            onChange={handleInputChange}
                            placeholder="Ej: 15.5"
                        />
                    </li>

                    <li>
                        <label htmlFor="dateTime" style={{ marginRight: "50px" }}>Fecha:</label>
                        <input
                            id="dateTime"
                            name='dateTime'
                            type="datetime-local"
                            value={formData.dateTime}
                            onChange={handleInputChange}
                        />
                    </li>
                    <li>
                        <label htmlFor="location" style={{ marginRight: "50px" }}>Ubicación:</label>
                        <input
                            id='location'
                            name='location'
                            type="text"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Concepción, Chile"
                        />
                    </li>
                </ul>

                <button type="submit">Guardar clima</button>
            </form>

            <button onClick={logOut}>Cerrar Sesión</button>
        </div>
    );
}

export default Admin;