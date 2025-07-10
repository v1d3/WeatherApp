import solGIF from '../assets/sol.gif';

import UserService from '../services/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/table';
import Recomendacion from '../components/recomendacion';
import ClimaActual from '../components/climaActual';
import PlanificacionP from '../components/planificacionPerosnal';
import BarraSuperior from '../components/barraSuperior';
import '../index.css'
import UsefulRecommendation from '../components/usefulRecommendation';
import logo from '../assets/logo.webp';
import {Cloud, MapPin } from 'lucide-react';
import { getFilteredActivities } from '../services/user';

function User() {
  const [sobre, setsobre] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
  const [weatherId, setWeatherId] = useState(null);
  const [sobreponer, setsobreponer] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const navigate = useNavigate();
  const [extraTab, setRecTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

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
  useEffect(() => {
    if (extraTab === 1) {
      setLoading(true);
      // Usar la nueva función que filtra por condiciones climáticas
      getFilteredActivities()
        .then(data => {
          setActivities(data);
          setError(null);
        })
        .catch(err => {
          console.error("Error fetching filtered activities:", err);
          setError("Error al cargar actividades recomendables");
          setActivities([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }

  }, [extraTab]);
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
          background: 'linear-gradient(to right, rgba(34, 211, 238, 0.3), rgba(59, 130, 246, 0.3))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'intensePulse 4s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: '25%',
          width: '20rem',
          height: '20rem',
          background: 'linear-gradient(to left, rgba(147, 51, 234, 0.25), rgba(236, 72, 153, 0.25))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'intensePulse 4.5s infinite',
          animationDelay: '1s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '16rem',
          height: '16rem',
          background: 'linear-gradient(to top right, rgba(67, 56, 202, 0.2), rgba(34, 211, 238, 0.2))',
          borderRadius: '50%',
          filter: 'blur(3rem)',
          animation: 'intensePulse 5s infinite',
          animationDelay: '0.5s'
        }}></div>
      </div>
        
      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        padding: '1rem 0 0.5rem' // Reduced padding
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3">
                <div style={{display: 'flex',alignItems: 'center',gap: '1px' }}>
                <img src={logo} alt="Logo" style={{ width: '70px',height: '70px'}}/>
                <h1 style={{fontSize: '1.5rem', fontWeight: 'bold',color: 'rgba(255, 255, 255, 0.7)', margin: 0}}>WeatherPro</h1>
                </div>
                {ciudadSeleccionada && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '9999px',
                    padding: '0.25rem 0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <MapPin style={{ width: '0.875rem', height: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }} />
                    <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: '500' }}>
                      {ciudadSeleccionada}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6 text-end">
              <BarraSuperior onLogout={logOut} />
            </div>
          </div>
        </div>
        </header>
      {/*listaaaaaaaaaaaaaa */}
         {extraTab === 1 && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1rem',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              color: 'white',
            }}>
              <h3 style={{textAlign: 'center', marginBottom: '1rem'}}>Opciones Disponibles</h3>
             {loading && <p>Cargando...</p>}
             {!loading && error && <p style={{ color: 'red' }}>{error}</p>}
             {!loading && !error && activities.length === 0 && <p>No hay opciones disponibles.</p>}
             {!loading && !error && activities.length > 0 && (
               <ul>
                 {activities.map(act => (
                   <li key={act.id}>{act.name}</li>
                 ))}
               </ul>
             )}
          
          <button
          onClick={() => setRecTab(0)}
          style={{
            display: 'block',
            margin: '1rem auto 0',
            background: 'linear-gradient(45deg, #3b82f6, rgb(10, 195, 228))',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(45deg, #2563eb, #0ab3e4)'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(45deg, #3b82f6, rgb(10, 195, 228))'}
        >
          Cerrar
        </button>
      </div>
    </div>
  )}
      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        <div className="container">
          {/* Weather Section */}
          <section className="mb-3"> {/* Reduced margin */}
            <ClimaActual
              ciudadSeleccionada={ciudadSeleccionada}
              setCiudadSeleccionada={setCiudadSeleccionada}
              onWeatherIdChange={setWeatherId}
            />
          </section>

          {/* Forecast Section */}
          <section className="mb-3"> {/* Reduced margin */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1rem', // Reduced border radius
              padding: '1rem', // Reduced padding
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'white', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>Pronóstico de Hoy</h3>
              <Table ciudadSeleccionada={ciudadSeleccionada} />
            </div>
          </section>

          {/* Bottom Section - Cards Grid */}
          <section>
            <div className="row g-3">
              {/* RECOMENDACION */}

              <div className="col-lg-4 col-md-6">
                <div className="h-100" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  position: 'relative' 
                }}>
                  {/* Opciones */}
                  <button
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '1rem',
                      background: 'linear-gradient(45deg, #3b82f6,rgb(10, 195, 228))',
                      border: 'none',
                      borderRadius: '0.5rem',
                      transition: 'all 0.3s ease',
                      color: 'white',
                      cursor: 'pointer', 
                      padding: '0.375rem 0.75rem',
                    }}
                    onClick={() => setRecTab(1)}
                    onMouseEnter={() => console.log("hovered_options")}
                  >
                    Opciones
                  </button>
                  <h4 style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    textAlign: 'center'
                  }}>Recomendaciones</h4>

                  <Recomendacion onActivityChange={setCurrentActivity} />
                </div>
              </div>

              {/* Sugerencias */}
              <div className="col-lg-4 col-md-6">
                <div className="h-100" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                  <h4 style={{
                    color: 'white', 
                    fontWeight: '600',
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    textAlign: 'center'
                  }}>Sugerencias</h4>
                  <UsefulRecommendation 
                    ciudadSeleccionada={ciudadSeleccionada}
                    activity={currentActivity}/>
                </div>
              </div>

              {/* planificacion personal*/}
              <div className="col-lg-4 col-md-12">
                <div className="h-100" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                  <h4 style={{
                    color: 'white', // Cambiar a blanco
                    fontWeight: '600',
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    textAlign: 'center'
                  }}>Agenda tu actividad</h4>
                  <PlanificacionP />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </>
  );
}

export default User;