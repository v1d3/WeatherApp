import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { getActivities, updateActivityWeight } from '../services/user.js'; // Importar la función correcta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faThumbsUp, faThumbsDown , faStop } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/user.module.css';

const Recomendacion = forwardRef(({ username, selectedDuration, setSelectedDuration, onSeleccionarActividadExitosa, style }, ref) => {
  const [actividad, setActividad] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const unlockKey = `actividadUnlockTime_${username}`;
  const actividadKey = `actividadActual_${username}`;

  const cargarActividad = async () => {
    try {
      setLoading(true);
      console.log('Cargando nueva actividad...');
      const resultado = await getActivities();
      console.log('Nueva actividad cargada:', resultado);
      setActividad(resultado);
      // Resetear el estado de selección con la nueva actividad
      if(!localStorage.getItem(unlockKey)){
        setSelected(false);
      }
    } catch (error) {
      console.error('Error al obtener actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const detenerActividad = async () => {
    try{
      if(localStorage.getItem(unlockKey)){
        console.log('Deteniendo actividad')
        localStorage.setItem(unlockKey, Date.now())
        setSelected(false);
        localStorage.removeItem(unlockKey);
        localStorage.removeItem(actividadKey);
      }
    } catch (error) {
      console.error('Error al detener actividad: ', error)
    }
  }

  const seleccionarActividad = async (val) => {
    console.log("PROBANDO: ", val)
    try {
      setLoading(true);
      if (actividad == null) {
        throw('No hay Actividad a evaluar');
      } else {
        // Crear una copia del objeto en lugar de modificar directamente
        const actividadActualizada = {...actividad};
        
        // Mejor manejo del peso actual para asegurar que se tome el valor real
        const pesoActual = actividadActualizada.weight !== undefined && actividadActualizada.weight !== null 
          ? parseFloat(actividadActualizada.weight) 
          : 1.0;
    
        console.log(`Valor de peso actual antes de modificar: ${pesoActual}`);
    
        let nuevoPeso;
        
        if(val === 1) {
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

            // Calcula el tiempo de desbloqueo y guárdalo
            const unlockTime = Date.now() + selectedDuration * 1000;
            localStorage.setItem(unlockKey, unlockTime);
            localStorage.setItem(actividadKey, JSON.stringify(actividad)); // <-- Guarda la actividad

            setTimeout(() => {
              setSelected(false);
              localStorage.removeItem(unlockKey);
              localStorage.removeItem(actividadKey);
            }, selectedDuration * 1000);
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
  
  // Exponer la función al padre
  useImperativeHandle(ref, () => ({
    seleccionarActividadLike: async () => await seleccionarActividad(1)
  }));

  useEffect(() => {
    if (!actividad) {
      cargarActividad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const unlockTime = localStorage.getItem(unlockKey);
    if (unlockTime) {
      const now = Date.now();
      const remaining = Number(unlockTime) - now;
      console.log("Tiempo restante: ", Number(unlockTime), " - ", now, " = ", remaining)
      if (remaining > 0) {
        setSelected(true);
        console.log("Seleccionado es TRUE")
        setTimeout(() => {
          setSelected(false);
          localStorage.removeItem(unlockKey);
          localStorage.removeItem(actividadKey);
        }, remaining);
      } else {
        setSelected(false);
        localStorage.removeItem(unlockKey);
        localStorage.removeItem(actividadKey);
      }
    }
  }, [unlockKey, actividadKey]);

//Aqui boton de recomendación
  return (
    <div style={style}>
      {/* Input para que el usuario edite la duración */}
        <div className={`${styles.new_recommendation}`}
            onClick={() => actividad && !selected && cargarActividad()}
            style={{ cursor: actividad && !selected ? 'pointer' : 'default', opacity: actividad &&  !selected ? 1 : 0.5 }}>
            <FontAwesomeIcon icon={faArrowRight} size="1x"/> 
        </div>
        
        <div className={`${styles.like_recommendation}`} 
             onClick={() => actividad && !selected && onSeleccionarActividadExitosa()} 
             style={{ cursor: actividad && !selected ? 'pointer' : 'default', opacity: actividad &&  !selected ? 1 : 0.5 }}>
            <FontAwesomeIcon icon={faThumbsUp} size="1x"/> 
        </div>

        <div className={`${styles.dislike_recommendation}`} 
             onClick={() => actividad && !selected && seleccionarActividad(0)} 
             style={{ cursor: actividad && !selected ? 'pointer' : 'default', opacity: actividad && !selected ? 1 : 0.5 }}>
            <FontAwesomeIcon icon={faThumbsDown} size="1x"/> 
        </div>

        <div className={`${styles.stop_recommendation}`} 
             onClick={() => !(actividad && !selected) && detenerActividad()} 
             style={{ cursor: !(actividad && !selected) ? 'pointer' : 'default', opacity: !(actividad && !selected) ? 1 : 0.5 }}>
            <FontAwesomeIcon icon={faStop} size="1x"/> 
        </div>

        <div className={`${styles.cuadro_recomendacion}`}>
            {actividad ? (
                <div style={{ marginTop: '1rem' }}>
                    <p> {actividad.name}</p> 
                </div>
            ) : (
            <p style={{ marginTop: '1rem' }}>No una hay recomendacion disponible</p>
            )}
        </div>
        <div className={`${styles.consejo_C1}`}>
            <p style={{ marginTop: '1rem', color: 'white' }}>Sugerencia</p>

            <div className={`${styles.consejo_C2}`}></div>

        </div>
    </div>
  );
});

export default Recomendacion;