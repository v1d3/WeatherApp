import React, { useState, useEffect } from 'react';
import { getActivities, updateActivityWeight, getScheduledActivities } from '../services/user.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faThumbsUp, faThumbsDown, faCalendarAlt, faExclamationTriangle, faStop, faClock } from '@fortawesome/free-solid-svg-icons';

function Recomendacion({ onActivityChange  }) {
  const [actividad, setActividad] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduledActivity, setScheduledActivity] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [weatherWarning, setWeatherWarning] = useState(false);
  const [showDurationPanel, setShowDurationPanel] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [activityTimer, setActivityTimer] = useState(null);

  // Function to check if scheduled activity meets weather requirements
  const checkWeatherCompatibility = async (activity) => {
    try {
      // Import the weather service to get current weather data
      const UserService = await import('../services/user.js');
      const currentWeatherData = await UserService.default.getWeatherData();
      
      if (!currentWeatherData.clima || !currentWeatherData.clima[0]) {
        return false;
      }
      console.log('Datos del clima actual obtenidos:', currentWeatherData);
      console.log('Actividad a evaluar:', activity);

      const currentWeather = currentWeatherData.clima[0];
      const temp = currentWeather.temperature;
      const humidity = currentWeather.humidity;
      const windSpeed = currentWeather.windSpeed;
      const weatherName = currentWeather.weather?.name;

      // Check temperature range
      if (activity.minTemperature !== null && temp < activity.minTemperature) {
        return false;
      }
      if (activity.maxTemperature !== null && temp > activity.maxTemperature) {
        return false;
      }

      // Check humidity range
      if (activity.minHumidity !== null && humidity < activity.minHumidity) {
        return false;
      }
      if (activity.maxHumidity !== null && humidity > activity.maxHumidity) {
        return false;
      }

      // Check wind speed range
      if (activity.minWindSpeed !== null && windSpeed < activity.minWindSpeed) {
        return false;
      }
      if (activity.maxWindSpeed !== null && windSpeed > activity.maxWindSpeed) {
        return false;
      }

      // Check if current weather is in the activity's compatible weather list
      // This assumes the activity has weather compatibility data
      if (activity.weathers && activity.weathers.length > 0) {
        const isWeatherCompatible = activity.weathers.some(weather => 
          weather.name && weatherName && 
          weather.name.toLowerCase() === weatherName.toLowerCase()
        );
        if (!isWeatherCompatible) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking weather compatibility:', error);
      return false;
    }
  };

  // Efecto para verificar actividades programadas cada minuto
  useEffect(() => {
    const checkScheduledActivities = async () => {
      try {
        console.log('Verificando actividades programadas...');

        // Verificar si tenemos token de calendario
        const calendarToken = localStorage.getItem('calendarToken');
        if (!calendarToken) {
          console.warn('No hay token de calendario disponible');
          return;
        }

        const scheduledActivities = await getScheduledActivities();
        console.log('Actividades programadas obtenidas:', scheduledActivities);

        if (!scheduledActivities || scheduledActivities.length === 0) {
          console.log('No hay actividades programadas disponibles');
          setIsScheduled(false);
          setScheduledActivity(null);
          setWeatherWarning(false);
          return;
        }

        const now = new Date();
        // Obtener timestamp en milisegundos de la hora actual
        const nowTime = now.getTime();
        console.log(`Hora actual: ${now.toLocaleString()}, Timestamp: ${nowTime}`);

        // Buscar si hay alguna actividad programada que esté en progreso (hora actual entre inicio y +1 hora)
        const matchingActivity = scheduledActivities.find(act => {
          // Convertir la fecha de la actividad a Date
          const activityStartTime = new Date(act.scheduledDate || act.timeInit).getTime();
          // Calcular una hora después como tiempo de finalización
          const activityEndTime = activityStartTime + (60 * 60 * 1000); // +1 hora en milisegundos

          // La actividad está en progreso si el tiempo actual está entre el inicio y el fin
          const isInProgress = nowTime >= activityStartTime && nowTime <= activityEndTime;

          console.log(
            `Actividad: ${act.name}, ` +
            `Inicio: ${new Date(activityStartTime).toLocaleString()}, ` +
            `Fin: ${new Date(activityEndTime).toLocaleString()}, ` +
            `Actual: ${new Date(nowTime).toLocaleString()}, ` +
            `En progreso: ${isInProgress}`
          );

          return isInProgress;
        });

        if (matchingActivity) {
          console.log('¡Actividad programada en progreso encontrada!', matchingActivity);
          
          // Check weather compatibility
          console.log('Verificando compatibilidad climática para la actividad:', matchingActivity);
          const isWeatherCompatible = await checkWeatherCompatibility(matchingActivity);
          console.log('¿Actividad compatible con clima actual?', isWeatherCompatible);
          
          setScheduledActivity(matchingActivity);
          setActividad(matchingActivity);
          setIsScheduled(true);
          setWeatherWarning(!isWeatherCompatible);

          // Notificar al usuario si el navegador lo permite y no se ha mostrado antes esta actividad
          if ('Notification' in window && Notification.permission === "granted" &&
            (!scheduledActivity || scheduledActivity.id !== matchingActivity.id)) {
            try {
              const notificationBody = isWeatherCompatible 
                ? `${matchingActivity.name} está programada ahora`
                : `${matchingActivity.name} está programada ahora (condiciones climáticas no ideales)`;
              
              new Notification("¡Actividad en progreso!", {
                body: notificationBody,
                icon: "/favicon.ico"
              });
            } catch (notifError) {
              console.error('Error al mostrar notificación:', notifError);
            }
          }
        } else {
          console.log('No se encontraron actividades en progreso actualmente');
          setIsScheduled(false);
          setScheduledActivity(null);
          setWeatherWarning(false);
        }
      } catch (error) {
        console.error('Error al verificar actividades programadas:', error);
      }
    };

    // Solicitar permisos de notificación al cargar si el navegador lo soporta
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log(`Permiso de notificación: ${permission}`);
      });
    }

    // Verificar inmediatamente al montar el componente
    checkScheduledActivities();

    // Configurar intervalo para verificar cada minuto
    const intervalId = setInterval(checkScheduledActivities, 60000);
    console.log('Intervalo de verificación de actividades configurado');

    // Limpiar intervalo al desmontar
    return () => {
      console.log('Limpiando intervalo de verificación de actividades');
      clearInterval(intervalId);
    };
  }, []);

  // Cargar actividad al inicio
  useEffect(() => {
    cargarActividad();
  }, []);

  const cargarActividad = async () => {
    try {
      setLoading(true);
      console.log('Cargando nueva actividad...');

      // Si hay una actividad programada para este momento, mostrarla
      if (scheduledActivity) {
        console.log('Mostrando actividad programada:', scheduledActivity);
        setActividad(scheduledActivity);
        onActivityChange(resultado);
        setIsScheduled(true);
      } else {
        // Si no hay actividad programada, obtener recomendación normal
        const resultado = await getActivities();
        console.log('Nueva actividad cargada:', resultado);
        setActividad(resultado);
        onActivityChange(resultado);
        setIsScheduled(false);
      }

      // Resetear el estado de selección con la nueva actividad
      setSelected(false);
      setShowDurationPanel(false);
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      setActividad(null);
      onActivityChange(null); // ← Notifica el cambio
    } finally {
      setLoading(false);
    }
  };

  const mostrarPanelDuracion = () => {
    if (!actividad || isScheduled) return;
    setShowDurationPanel(true);
  };

  const confirmarDuracion = async () => {
    try {
      setLoading(true);
      if (actividad == null) {
        throw ('No hay Actividad a evaluar');
      }

      // Crear una copia del objeto en lugar de modificar directamente
      const actividadActualizada = { ...actividad };

      // Mejor manejo del peso actual para asegurar que se tome el valor real
      const pesoActual = actividadActualizada.weight !== undefined && actividadActualizada.weight !== null
        ? parseFloat(actividadActualizada.weight)
        : 1.0;

      console.log(`Valor de peso actual antes de modificar: ${pesoActual}`);

      // Cuando se confirma la duración (equivalente a "Me gusta")
      const nuevoPeso = pesoActual * 1.1;
      console.log(`Calculando nuevo peso: ${pesoActual} * 1.1 = ${nuevoPeso}`);

      try {
        // Aseguramos que nuevoPeso esté dentro de los límites
        const pesoLimitado = Math.max(0.1, Math.min(nuevoPeso, 10.0));

        // Comprobar si el peso está dentro del rango permitido por la BD
        if (pesoLimitado >= 1.0) {
          const respuesta = await updateActivityWeight(actividadActualizada.id, pesoLimitado);
          console.log('Actividad actualizada correctamente con like', respuesta);

          // Si la API devuelve la actividad actualizada, usamos esa información
          if (respuesta && respuesta.weight !== undefined) {
            actividadActualizada.weight = respuesta.weight;
          } else {
            // Si no, usamos nuestro valor calculado
            actividadActualizada.weight = pesoLimitado;
          }
        } else {
          console.log('No se aplicó el cambio: el peso calculado es menor al mínimo permitido por la BD');
        }

        setActividad(actividadActualizada);
        setSelected(true);
        setShowDurationPanel(false);

        // Configurar timer para desbloquear la actividad
        const timer = setTimeout(() => {
          setSelected(false);
          setActivityTimer(null);
          console.log('Actividad desbloqueada automáticamente');
        }, selectedDuration * 60 * 1000); // Convertir minutos a milisegundos

        setActivityTimer(timer);
      } catch (error) {
        console.error('Error al actualizar la actividad (like):', error);
      }
    } catch (error) {
      console.error('Error al confirmar duración:', error);
    } finally {
      setLoading(false);
    }
  };

  const detenerActividad = () => {
    if (activityTimer) {
      clearTimeout(activityTimer);
      setActivityTimer(null);
    }
    setSelected(false);
    setShowDurationPanel(false);
    console.log('Actividad detenida manualmente');
  };

  const seleccionarActividad = async (val) => {
    try {
      setLoading(true);
      if (actividad == null) {
        throw ('No hay Actividad a evaluar');
      } else {
        // Crear una copia del objeto en lugar de modificar directamente
        const actividadActualizada = { ...actividad };

        // Mejor manejo del peso actual para asegurar que se tome el valor real
        const pesoActual = actividadActualizada.weight !== undefined && actividadActualizada.weight !== null
          ? parseFloat(actividadActualizada.weight)
          : 1.0;

        console.log(`Valor de peso actual antes de modificar: ${pesoActual}`);

        // Solo manejar dislike aquí, ya que like ahora va por confirmarDuracion
        if (val === 0) {
          // Dislike (pulgar abajo)
          const nuevoPeso = pesoActual * 0.9;
          const pesoLimitado = Math.max(0.1, Math.min(nuevoPeso, 10.0));

          // Solo intentar actualizar si el nuevo peso es >= 1.0 (límite de la BD)
          if (pesoLimitado >= 1.0) {
            try {
              await updateActivityWeight(actividadActualizada.id, pesoLimitado);
              console.log('Actividad actualizada correctamente con dislike.');
            } catch (error) {
              console.error('Error al actualizar la actividad (dislike):', error);
            }
          } else {
            actividadActualizada.weight = pesoLimitado;
          }

          // Cargar nueva actividad cuando no gusta
          await cargarActividad();
        }
      }

      if (val === 1) {
        setActividad(actividadActualizada);
        onActivityChange(actividadActualizada); //  Notifica el cambio
        setSelected(true);
      } else {
        await cargarActividad();
      }

    } catch (error) {
      console.error('Error al clasificar la actividad:', error);
    } finally {
      setLoading(false);
    }
  };


  //Aqui boton de recomendación
  return (
    <div className="d-flex flex-column align-items-center" style={{ maxWidth: '28rem', margin: '0 auto', padding: '0.5rem' }}>
   
      {/* Panel de duración */}
      {showDurationPanel && (
        <div className="card bg-gradient border-0 shadow-lg w-100 mb-3" 
             style={{ 
               background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
               borderRadius: '0.75rem',
               border: '1px solid rgba(139, 92, 246, 0.3) !important'
             }}>
          <div className="card-body text-center py-3">
            <h6 className="text-white mb-3">
              <FontAwesomeIcon icon={faClock} className="me-2" />
              ¿Cuánto tiempo quieres realizar esta actividad?
            </h6>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <input
                type="number"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="form-control text-center"
                style={{ width: '80px' }}
                min="1"
                max="180"
              />
              <span className="text-white">minutos</span>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={confirmarDuracion}
                disabled={loading}
                className="btn btn-success btn-sm flex-fill"
                style={{ borderRadius: '0.5rem' }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowDurationPanel(false)}
                className="btn btn-secondary btn-sm flex-fill"
                style={{ borderRadius: '0.5rem' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
       

      {/* Tarjeta de recomendación */}
      <div className="card bg-gradient border-0 shadow-lg w-100 mb-3" 
           style={{ 
             background: 'linear-gradient(45deg, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
             borderRadius: '0.75rem',
             minHeight: '80px',
             border: '1px solid rgba(34, 211, 238, 0.3) !important'
           }}>
        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center py-2">
          {actividad ? (
            <div>
              <p className="text-white fs-6 fw-medium mb-0">
                {isScheduled && <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px', color: '#4285f4' }} />}
                {selected && <FontAwesomeIcon icon={faClock} style={{ marginRight: '10px', color: '#10b981' }} />}
                {actividad.name}
              </p>
              {/* Weather warning message */}
              {isScheduled && weatherWarning && (
                <div style={{ 
                  background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.9))',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  marginTop: '12px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <FontAwesomeIcon 
                    icon={faExclamationTriangle} 
                    style={{ 
                      color: '#fff', 
                      fontSize: '16px',
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                    }} 
                  />
                  <span style={{ fontWeight: '500', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                    Esta actividad no cumple las condiciones climáticas requeridas
                  </span>
                </div>
              )}
              {/* Mostrar tiempo restante si la actividad está activa */}
              {selected && !isScheduled && (
                <div className="text-white-50 small mt-2">
                  Duración: {selectedDuration} minutos
                </div>
              )}
            </div>
          ) : loading ? (
            <p className="text-white-50 small mb-0">Cargando recomendación...</p>
          ) : (
            <p className="text-white-50 small mb-0">No hay una recomendación disponible</p>
          )}
        </div>
       

      </div>
      {/* Botones */}
      <div className="d-flex flex-column gap-2 w-100">
        <button
          onClick={cargarActividad}
          disabled={loading || selected || showDurationPanel}
          className={`btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 ${
            (loading || selected || showDurationPanel) ? 'opacity-50' : ''
          }`}
          style={{ 
            background: 'linear-gradient(45deg, #3b82f6,rgb(10, 195, 228))',
            border: 'none',
            borderRadius: '0.5rem',
            transition: 'all 0.3s ease',
            padding: '0.375rem 0.75rem',
            cursor: (loading || selected || showDurationPanel) ? 'not-allowed' : 'pointer'
          }}  
        >
          <FontAwesomeIcon icon={faArrowRight} style={{ width: '0.875rem', height: '0.875rem' }} />
          <span>Siguiente</span>
        </button>

        <button
          onClick={mostrarPanelDuracion}
          disabled={selected || isScheduled || loading || showDurationPanel}
          className={`btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2 ${
            (selected || isScheduled || loading || showDurationPanel) ? 'opacity-50' : ''
          }`}
          style={{ 
            background: 'linear-gradient(45deg,rgb(6, 136, 212),rgb(96, 224, 177))',
            border: 'none',
            borderRadius: '0.5rem',
            transition: 'all 0.3s ease',
            color: 'white',
            cursor: (selected || isScheduled || loading || showDurationPanel) ? 'not-allowed' : 'pointer',
            padding: '0.375rem 0.75rem'
          }}
        >
          <FontAwesomeIcon icon={faThumbsUp} style={{ width: '0.875rem', height: '0.875rem' }} />
          <span>Me gusta</span>
        </button>

        <button
          onClick={() => seleccionarActividad(0)}
          disabled={selected || isScheduled || loading || showDurationPanel}
          className={`btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2 ${
            (selected || isScheduled || loading || showDurationPanel) ? 'opacity-50' : ''
          }`}
          style={{ 
            background: 'linear-gradient(45deg,rgb(169, 75, 240), #ec4899)',
            border: 'none',
            borderRadius: '0.5rem',
            transition: 'all 0.3s ease',
            color: 'white',
            cursor: (selected || isScheduled || loading || showDurationPanel) ? 'not-allowed' : 'pointer',
            padding: '0.375rem 0.75rem'
          }}
        >
          <FontAwesomeIcon icon={faThumbsDown} style={{ width: '0.875rem', height: '0.875rem' }} />
          <span>No me gusta</span>
        </button>

        {/* Botón Detener - solo visible cuando hay una actividad activa */}
        {selected && !isScheduled && (
          <button
            onClick={detenerActividad}
            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ 
              background: 'linear-gradient(45deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '0.5rem',
              transition: 'all 0.3s ease',
              color: 'white',
              padding: '0.375rem 0.75rem'
            }}
          >
            <FontAwesomeIcon icon={faStop} style={{ width: '0.875rem', height: '0.875rem' }} />
            <span>Detener</span>
          </button>


        )}
      </div>
    </div>
  );
}

export default Recomendacion;