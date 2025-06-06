import React, { useState } from 'react';
import { getActivities, modifyActivity } from '../services/user.js'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

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
            
            // Usar la API que detecta automáticamente si es default o no
            const respuesta = await modifyActivity(actividadActualizada.id, pesoLimitado);
            console.log('Actividad actualizada correctamente con like', respuesta);
            
            // Si la API devuelve la actividad actualizada, usamos esa información
            if (respuesta && respuesta.weight !== undefined) {
              actividadActualizada.weight = respuesta.weight;
            } else {
              // Si no, usamos nuestro valor calculado
              actividadActualizada.weight = pesoLimitado;
            }
            
            setActividad(actividadActualizada);
            setSelected(true);
          } catch (error) {
            console.error('Error al actualizar la actividad (like):', error);
          }
        } else {
          // Similar para el pulgar abajo...
          nuevoPeso = pesoActual * 0.9;
          const pesoLimitado = Math.max(0.1, Math.min(nuevoPeso, 10.0));
          
          try {
            await modifyActivity(actividadActualizada.id, pesoLimitado);
            console.log('Actividad actualizada correctamente con dislike. Cargando nueva actividad...');
          } catch (error) {
            console.error('Error al actualizar la actividad (dislike):', error);
          }
          
          // Cargar nueva actividad cuando no gusta
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