import React, { useState, useEffect } from 'react';
import { getActivities, updateActivityWeight, getScheduledActivities } from '../services/user.js'; // Añadir getScheduledActivities
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faThumbsUp, faThumbsDown, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/user.module.css';

function Recomendacion() {
  const [actividad, setActividad] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduledActivity, setScheduledActivity] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);

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
          setScheduledActivity(matchingActivity);
          // Cargar esta actividad automáticamente
          setActividad(matchingActivity);
          setIsScheduled(true);

          // Notificar al usuario si el navegador lo permite y no se ha mostrado antes esta actividad
          if ('Notification' in window && Notification.permission === "granted" &&
            (!scheduledActivity || scheduledActivity.id !== matchingActivity.id)) {
            try {
              new Notification("¡Actividad en progreso!", {
                body: `${matchingActivity.name} está programada ahora`,
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

  const cargarActividad = async () => {
    try {
      setLoading(true);
      console.log('Cargando nueva actividad...');

      // Si hay una actividad programada para este momento, mostrarla
      if (scheduledActivity) {
        console.log('Mostrando actividad programada:', scheduledActivity);
        setActividad(scheduledActivity);
        setIsScheduled(true);
      } else {
        // Si no hay actividad programada, obtener recomendación normal
        const resultado = await getActivities();
        console.log('Nueva actividad cargada:', resultado);
        setActividad(resultado);
        setIsScheduled(false);
      }

      // Resetear el estado de selección con la nueva actividad
      setSelected(false);
    } catch (error) {
      console.error('Error al obtener actividades:', error);
    } finally {
      setLoading(false);
    }
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

        let nuevoPeso;

        if (val === 1) {
          // Cuando se pulsa "Me gusta" (pulgar arriba)
          nuevoPeso = pesoActual * 1.1;
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
          } catch (error) {
            console.error('Error al actualizar la actividad (like):', error);
          }
        } else {
          // Dislike (pulgar abajo)
          nuevoPeso = pesoActual * 0.9;
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
            console.log('Peso mínimo alcanzado (1.0), no se aplica disminución adicional');
          }

          // Cargar nueva actividad cuando no gusta (independientemente de si se actualizó o no)
          await cargarActividad();
        }
      }
    } catch (error) {
      console.error('Error al clasificar la actividad:', error);
    } finally {
      setLoading(false);
    }
  };


  //Aqui boton de recomendación
  return (
    <div>
      <div className={`${styles.new_recommendation}`} onClick={cargarActividad} style={{ cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faArrowRight} size="1x" />
      </div>

      <div className={`${styles.like_recommendation}`}
        onClick={() => !selected && !isScheduled && seleccionarActividad(1)}
        style={{ cursor: !selected && !isScheduled ? 'pointer' : 'default', opacity: !selected && !isScheduled ? 1 : 0.5 }}>
        <FontAwesomeIcon icon={faThumbsUp} size="1x" />
      </div>

      <div className={`${styles.dislike_recommendation}`}
        onClick={() => !selected && !isScheduled && seleccionarActividad(0)}
        style={{ cursor: !selected && !isScheduled ? 'pointer' : 'default', opacity: !selected && !isScheduled ? 1 : 0.5 }}>
        <FontAwesomeIcon icon={faThumbsDown} size="1x" />
      </div>

      <div className={`${styles.cuadro_recomendacion}`}>
        {actividad ? (
          <div style={{ marginTop: '1rem' }}>
            <p>
              {isScheduled && <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px', color: '#4285f4' }} />}
              {actividad.name}
            </p>
          </div>
        ) : (
          <p style={{ marginTop: '1rem' }}>No una hay recomendacion disponible</p>
        )}
      </div>
      <div className={`${styles.consejo_C1}`}>
        <p style={{ marginTop: '1rem', color: 'white' }}>
          {isScheduled ? 'Actividad Programada' : 'Sugerencia'}
        </p>

        <div className={`${styles.consejo_C2}`}></div>

      </div>
    </div>
  );
}

export default Recomendacion;