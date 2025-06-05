import React, { useState } from 'react';
import { getActivities, updateActivityWeight } from '../services/user.js'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/user.module.css';

function Recomendacion() {
  const [actividad, setActividad] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const cargarActividad = async () => {
    try {
      setLoading(true);
      console.log('Cargando nueva actividad...');
      const resultado = await getActivities();
      console.log('Nueva actividad cargada:', resultado);
      setActividad(resultado);
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
      if(actividad == null) {
        throw('No hay Actividad a evaluar');
      } else {
        // Depuración para ver la estructura del objeto actividad
        console.log('Estructura del objeto actividad:', JSON.stringify(actividad, null, 2));
        console.log('Propiedades disponibles:', Object.keys(actividad));
        console.log('Valor de weight:', actividad.weight);
        console.log('Valor de weather:', actividad.weather);
        
        // Crear una copia del objeto en lugar de modificar directamente
        const actividadActualizada = {...actividad};
        
        // 1. Verificar si la actividad tiene la propiedad 'weight' o 'weather'
        // Si no existe ninguna, inicializarla con un valor por defecto
        if (actividadActualizada.weight === undefined && actividadActualizada.weather === undefined) {
          actividadActualizada.weight = 1.0; // Valor por defecto
          console.log('Inicializando peso con valor por defecto: 1.0');
        }
        
        // 2. Determinar qué propiedad usar (weight o weather)
        const pesoPropiedad = actividadActualizada.weight !== undefined ? 'weight' : 'weather';
        console.log(`Usando propiedad: ${pesoPropiedad} con valor inicial: ${actividadActualizada[pesoPropiedad]}`);
        
        if(val === 1) {
          // Cuando se pulsa "Me gusta" (pulgar arriba)
          actividadActualizada[pesoPropiedad] = actividadActualizada[pesoPropiedad] * 1.1;
          actividadActualizada[pesoPropiedad] = Math.max(0.1, Math.min(actividadActualizada[pesoPropiedad], 10.0));
          
          // Actualizar en la base de datos
          await updateActivityWeight(actividadActualizada.id, actividadActualizada[pesoPropiedad]);
          
          // Actualizar el estado con la nueva copia
          setActividad(actividadActualizada);
          setSelected(true);
        } else {
          // Cuando se pulsa "No me gusta" (pulgar abajo)
          // Calcular el nuevo peso pero no actualizar el estado actual
          const nuevoPeso = actividadActualizada[pesoPropiedad] * 0.9;
          const pesoLimitado = Math.max(0.1, Math.min(nuevoPeso, 10.0));
          
          try {
            // Actualizar en la base de datos
            await updateActivityWeight(actividadActualizada.id, pesoLimitado);
            console.log('Peso actualizado correctamente para dislike. Cargando nueva actividad...');
          } catch (error) {
            console.error('Error al actualizar peso (dislike):', error);
            // Continuar de todos modos para cargar nueva actividad
          }
          
          // Cargar nueva actividad cuando no gusta - separado de la actualización del peso
          await cargarActividad();
          // No actualizamos el estado actividad aquí porque cargarActividad ya lo hace
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
            <FontAwesomeIcon icon={faArrowRight} size="1x"/> 
        </div>
        
        <div className={`${styles.like_recommendation}`} 
             onClick={() => !selected && seleccionarActividad(1)} 
             style={{ cursor: !selected ? 'pointer' : 'default', opacity: !selected ? 1 : 0.5 }}>
            <FontAwesomeIcon icon={faThumbsUp} size="1x"/> 
        </div>

        <div className={`${styles.dislike_recommendation}`} 
             onClick={() => !selected && seleccionarActividad(0)} 
             style={{ cursor: !selected ? 'pointer' : 'default', opacity: !selected ? 1 : 0.5 }}>
            <FontAwesomeIcon icon={faThumbsDown} size="1x"/> 
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
}

export default Recomendacion;