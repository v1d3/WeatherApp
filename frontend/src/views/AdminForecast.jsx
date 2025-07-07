import React, { useState, useEffect } from 'react';
import { weatherService } from '../services/admin';
import activityService from '../services/activity';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

import '../App.css';
import { faHammer, faPersonRunning, faCloud, faPerson } from '@fortawesome/free-solid-svg-icons';


function Admin() {
    const [weatherNames, setWeatherNames] = useState([]);
    const [formDataWeather, setFormDataWeather] = useState({
        weatherId: '', // Inicialmente vacío pero será seleccionado por el usuario
        dateTime: '',
        location: '',
        temperature: '',
        humidity: '',
        windSpeed: ''
    });

    const [formDataActivity, setFormDataActivity] = useState({
        name: '',
        minTemperature: '',
        maxTemperature: '',
        minHumidity: '',
        maxHumidity: '',
        minWindSpeed: '',
        maxWindSpeed: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setFormDataWeather({
            ...formDataWeather,
            weatherId: selectedWeatherId
        });

        console.log('Weather ID seleccionado:', selectedWeatherId, typeof selectedWeatherId);
    };

    const handleActivityChange = (e) => {
        const selectedActivityId = Number(e.target.value); // Convertir explícitamente a número

        setFormDataActivity({
            ...formDataActivity,
            name: selectedActivityId
        });

        console.log('Actividad seleccionada:', selectedActivityId, typeof selectedActivityId);
    };

    const handleSubmitWeather = async (e) => {
        e.preventDefault();
        if(isSubmitting) return; 
        setIsSubmitting(true);

        try {
            const { weatherId, dateTime, location, temperature, humidity, windSpeed } = formDataWeather;

            if (!weatherId || !dateTime || !location || !humidity || !windSpeed || !temperature) {
                var text = '';
                if (!weatherId) {
                    text = text + ' Clima';
                }
                if (!dateTime) {
                    if (text != '') {
                        text = text + ';';
                    }
                    text = text + ' Hora';
                }
                if (!location) {
                    if (text != '') {
                        text = text + ';';
                    }
                    text = text + ' Lugar';
                }
                if (!humidity) {
                    if (text != '') {
                        text = text + ';';
                    }
                    text = text + ' Humedad';
                }
                if (!windSpeed) {
                    if (text != '') {
                        text = text + ';';
                    }
                    text = text + ' Velocidad del viento';
                }
                if (!temperature) {
                    if (text != '') {
                        text = text + ';';
                    }
                    text = text + ' Temperatura';
                }
                throw new Error('Por favor complete todos los campos, falta:' + String(text));
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

            setIsSubmitting(false);
    
            alert('Datos guardados exitosamente');

            // Clear form
            setFormDataWeather({
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
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitActivity = async (e) => {
        e.preventDefault();

        try {
            const { name, minTemperature, maxTemperature, minHumidity, maxHumidity, minWindSpeed, maxWindSpeed } = formDataActivity;

            if (!name || !minTemperature || !maxTemperature || !minHumidity || !maxHumidity || !minWindSpeed || !maxWindSpeed) {
                throw new Error('Por favor complete todos los campos');
            }

            const minHumValue = parseInt(minHumidity);
            if (minHumValue < 0 || minHumValue > 100) {
                throw new Error('La humedad mínima debe estar entre 0 y 100%');
            }

            const maxHumValue = parseInt(maxHumidity);
            if (maxHumValue < 0 || maxHumValue > 100) {
                throw new Error('La humedad máxima debe estar entre 0 y 100%');
            }
            if (maxHumValue < minHumValue) {
                throw new Error('La humedad máxima debe ser mayor a la humedad mínima')
            }

            const maxTempValue = parseInt(maxTemperature);
            if (maxTempValue < -50 || maxTempValue > 50) {
                throw new Error('La temperatura mínima debe estar entre -50°C y 50°C');
            }

            const minTempValue = parseInt(minTemperature);
            if (minTempValue < -50 || minTempValue > 50) {
                throw new Error('La temperatura máxima debe estar entre -50°C y 50°C');
            }
            if (maxTempValue < minTempValue) {
                throw new Error('La temperatura máxima debe ser mayor a la temperatura mínima')
            }

            const minWindValue = parseFloat(minWindSpeed);
            if (minWindValue < 0 || minWindValue > 200) {
                throw new Error('La velocidad mínima del viento debe estar entre 0 y 200 km/h');
            }
            const maxWindValue = parseFloat(maxWindSpeed);
            if (maxWindValue < 0 || maxWindValue > 200) {
                throw new Error('La velocidad mínima del viento debe estar entre 0 y 200 km/h');
            }
            if (maxWindValue < minWindValue) {
                throw new Error('La velocidad máxima del viento debe ser mayor a la velocidad mínima')
            }

            await activityService.saveActivity({
                name,
                minTemperature: minTempValue,
                maxTemperature: maxTempValue,
                minHumidity: minHumValue,
                maxHumidity: maxHumValue,
                minWindSpeed: minWindValue,
                maxWindSpeed: maxWindValue
            });

            alert('Datos guardados exitosamente');

            // Clear form
            setFormDataActivity({
                name: '',
                minTemperature: '',
                maxTemperature: '',
                minHumidity: '',
                maxHumidity: '',
                minWindSpeed: '',
                maxWindSpeed: ''
            });
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    const handleInputChangeWeather = (e) => {
        const { name, value } = e.target;
        setFormDataWeather({
            ...formDataWeather,
            [name]: value
        });
    }

    const handleInputChangeActivity = (e) => {
        const { name, value } = e.target;
        setFormDataActivity({
            ...setFormDataActivity,
            [name]: value
        });
    }

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
 
    return(
        <>
        <div className='vh-100 d-flex'>
        <Sidebar title="Administrador" mainIcon={faHammer} sections={[
            {title: "Añadir Pronóstico", link: '/admin/forecast', icon: faCloud, isActive: true},
            {title: "Añadir Pronóstico", link: '/admin/activities', icon: faPersonRunning, isActive: false}
        ]} />
        <main className='flex-grow-1 bg-body-tertiary'>
        <div className=" col-12 col-sm-11 col-md-9 col-xl-6 m-auto">
        <form onSubmit={handleSubmitWeather}>
            <h1 className="h3 mb-4 fw-normal">Añadir Pronóstico</h1>
            <div className="row mb-3">
                <label htmlFor="weatherId" className="col-sm-3 col-form-label">Clima</label>
                <div className="col-sm-9">
                    <select
                        className='form-select'
                        id='weatherId'
                        name='weatherId'
                        value={formDataWeather.weatherId}
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
                </div>
            </div>
            <div className="row mb-3">
                <label htmlFor="temperature" className="text-align-center col-sm-3 col-form-label">Temperatura (°C)</label>
                <div className="col-sm-9">
                    <input className='form-control m-auto'
                        id='temperature'
                        name='temperature'
                        type="number"
                        step="0.1"
                        value={formDataWeather.temperature}
                        onChange={handleInputChangeWeather}
                        placeholder="Ej: 25.5"
                    />
                </div>
            </div>

            <div className="row mb-3">
                <label htmlFor="humidity" className="text-align-center col-sm-3 col-form-label">Humedad %</label>
                <div className="col-sm-9">
                    <input className='form-control m-auto'
                        id='humidity'
                        name='humidity'
                        type="number"
                        min="0"
                        max="100"
                        value={formDataWeather.humidity}
                        onChange={handleInputChangeWeather}
                        placeholder="Ej: 75"
                    />
                </div>
            </div>

            <div className="row mb-3">
                <label htmlFor="windSpeed" className="text-align-center col-sm-3 col-form-label">Viento (Km/h)</label>
                <div className="col-sm-9">
                    <input className='form-control m-auto'
                        id='windSpeed'
                        name='windSpeed'
                        type="number"
                        step="0.1"
                        value={formDataWeather.windSpeed}
                        onChange={handleInputChangeWeather}
                        placeholder="Ej: 15.5"
                    />
                </div>
            </div>

            <div className="row mb-3">
                <label htmlFor="dateTime" className="text-align-centr=er col-sm-3 col-form-label">Fecha</label>
                <div className="col-sm-9">
                    <input className='form-control m-auto'
                        id="dateTime"
                        name='dateTime'
                        type="datetime-local"
                        value={formDataWeather.dateTime}
                        onChange={handleInputChangeWeather}
                    />
                </div>
            </div>

            <div className="row mb-3">
                <label htmlFor="location" className="text-align-center col-sm-3 col-form-label">Ubicación</label>
                <div className="col-sm-9">
                    <input className='form-control m-auto'
                        id='location'
                        name='location'
                        type="text"
                        value={formDataWeather.location}
                        onChange={handleInputChangeWeather}
                        placeholder="Concepción"
                    />
                </div>
            </div>

            <button type="submit" className={`btn btn-primary col-12 col-md-6 ${isSubmitting ? "disabled" : ""}`}>
                {isSubmitting ? (
                    <span>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    </span>
                ) : (
                    "Añadir"
                )}
            </button>
        </form>
        </div>
 
        </main>
        </div>
        </>

    );
}

export default Admin;