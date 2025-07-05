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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #ec4899 100%)',
      position: 'relative',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '25%',
          width: '24rem',
          height: '24rem',
          background: 'linear-gradient(to right, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: '25%',
          width: '20rem',
          height: '20rem',
          background: 'linear-gradient(to left, rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'pulse 2s infinite',
          animationDelay: '1s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '16rem',
          height: '16rem',
          background: 'linear-gradient(to top right, rgba(67, 56, 202, 0.1), rgba(34, 211, 238, 0.1))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'pulse 2s infinite',
          animationDelay: '0.5s'
        }}></div>
      </div>
        
      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'black'
          }}>WeatherPro</h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <MapPin style={{ width: '1rem', height: '1rem', color: 'rgba(0, 0, 0, 0.8)' }} />
            <span style={{ color: 'rgba(0, 0, 0, 0.9)', fontSize: '0.875rem', fontWeight: '500' }}>
              {ciudadSeleccionada}
            </span>
          </div>
        </div>
        <BarraSuperior onLogout={logOut} />
      </header>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 1.5rem 2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem'
        }}>
          {/* Main Weather Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Current Weather Card */}
            <div style={{ gridColumn: 'span 2' }}>
              <ClimaActual
                ciudadSeleccionada={ciudadSeleccionada}
                setCiudadSeleccionada={setCiudadSeleccionada}
                onWeatherIdChange={setWeatherId}
              />
            </div>
            
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              gridColumn: 'span 2'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'black',
                marginBottom: '1.5rem'
              }}>Pronóstico de Hoy</h3>
              <Table />
            </div>
          </div>

          {/* Sidebar */}
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {/* RECOMENDACION */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <h4 style={{
                color: 'black',
                fontWeight: '600',
                fontSize: '1.125rem',
                marginBottom: '1rem'
              }}>Recomendaciones</h4>
              <Recomendacion />
            </div>

            {/* Sugerencias */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <h4 style={{
                color: 'black',
                fontWeight: '600',
                fontSize: '1.125rem',
                marginBottom: '1rem'
              }}>Sugerencias</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  background: 'linear-gradient(to right, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(34, 211, 238, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      backgroundColor: 'rgba(34, 211, 238, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem'
                    }}>
                      <Cloud style={{ width: '1.25rem', height: '1.25rem', color: 'rgb(103, 232, 249)' }} />
                    </div>
                    <div>
                      <div style={{
                        color: 'black',
                        fontWeight: '500',
                        fontSize: '0.875rem'
                      }}>Clima Fresco</div>
                      <div style={{
                        color: 'rgba(0, 0, 0, 0.7)',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem'
                      }}>Perfecto para actividades al aire libre. Considera llevar una chaqueta ligera.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* planificacion personal*/}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <h4 style={{
                color: 'black',
                fontWeight: '600',
                fontSize: '1.125rem',
                marginBottom: '1rem'
              }}>Agenda tu actividad</h4>
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