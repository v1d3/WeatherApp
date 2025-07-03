import solGIF from '../assets/sol.gif';

import UserService from '../services/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import Recomendacion from '../components/recomendacion';
import ClimaActual from '../components/climaActual';
import PlanificacionP from '../components/planificacionPerosnal';
import BarraSuperior from '../components/barraSuperior';

import '../index.css'

import {Cloud, MapPin } from 'lucide-react';

function User() {
  const [sobre, setsobre] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
  const [weatherId, setWeatherId] = useState(null);
  const [sobreponer, setsobreponer] = useState(false);
  const navigate = useNavigate();
  const weatherIdToIcon = {
    1: '01d',
    2: '02d',
    3: '03d',   // Nublado -> scattered clouds
    4: '04d',   // Muy nublado -> broken clouds
    10: '09d',  // Lluvia -> rain
    11: '10d',  // Llovizna -> shower rain
    12: '11d',  // Tormenta -> thunderstorm
    16: '13d',  // Nieve -> snow
    17: '50d',  // Neblina -> mist
    18: '50d',  // Niebla -> mist
    19: '50d',  // Polvo -> mist (or custom)
    20: '50d',  // Ceniza -> mist (or custom)
    21: '50d',  // Ráfagas -> mist (or custom)
    22: '50d',  // Tornado -> mist (or custom)
  };

  const logOut = () => {
    localStorage.removeItem('UserLoged');
    navigate('/login');
  };

  const fetchWeatherData = async () => {
    try {
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0)
        const weatherData = await UserService.getHourlyWeatherData(4);
        console.log('Datos del clima por hora:', weatherData)
        setWeatherData(weatherData);
    } catch (error) {
        console.error('Error al obtener clima:', error);
    }
  };

  const fetchActivities = async () => {
    try {
        console.log('Obteniendo actividades...');
        const activities = await UserService.getActivities();
        console.log('Actividades:', activities);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
    }
  };

  useEffect(() => { fetchWeatherData(); }, []);

  return (
  <>
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative z-0 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-l from-purple-400/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-6 lg:p-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-black">WeatherPro</h1>
            <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <MapPin className="w-4 h-4 text-black/80" />
              <span className="text-black/90 text-sm font-medium">{ciudadSeleccionada}</span>
            </div>
          </div>
          {/*BOTONEs */}
          <BarraSuperior onLogout={logOut} />
        </header>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-8">
          {/* Search Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Weather Display */}
            <div className="lg:col-span-8 space-y-8">
              {/* Current Weather Card */}
              <ClimaActual
                ciudadSeleccionada={ciudadSeleccionada}
                setCiudadSeleccionada={setCiudadSeleccionada}
                onWeatherIdChange={setWeatherId}
              />
              
              
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-6">Pronóstico de Hoy</h3>
                  <Table />
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* RECOMENDACION */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                <h4 className="text-black font-semibold text-lg mb-4">Recomendaciones</h4>
                <Recomendacion />
              </div>
              {/* Sugerencias */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                  <h4 className="text-black font-semibold text-lg mb-4">Sugerencias</h4>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/30">
                      <div className="flex items-start space-x-3">
                        <div className="bg-cyan-400/20 rounded-lg p-2">
                          <Cloud className="w-5 h-5 text-cyan-300" />
                        </div>
                        <div>
                          <div className="text-black font-medium text-sm">Clima Fresco</div>
                          <div className="text-black/70 text-xs mt-1">Perfecto para actividades al aire libre. Considera llevar una chaqueta ligera.</div>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
                {/* planificacion personal*/}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                  <h4 className="text-black font-semibold text-lg mb-4">Agenda tu actividad</h4>
                  <PlanificacionP />
                </div>
            </div>
          </div>
        </div>
    </div>
  </>
  );
}

export default User;