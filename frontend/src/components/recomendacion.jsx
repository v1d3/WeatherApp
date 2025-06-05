import React, { useState } from 'react';
import { getActivities } from '../services/user.js'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/user.module.css';

function Recomendacion() {
  const [actividad, setActividad] = useState(null);
  const [selected, setSelected] = useState(false);
  const cargarActividad = async () => {
    try {
        const resultado = await getActivities();
        setActividad(resultado);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
    }
  };

  const seleccionarActividad = async (val) => {
    try {
        if(actividad == null){
            throw('No hay Actividad a evaluar');
        }
        else{
            if(val == 1){
                actividad.weather *= 1.1;
                setSelected(true);
            } else {
                actividad.weather *= 0.9;
                cargarActividad;
            }

            actividad.weather = Math.max(0.1, Math.min(actividad.weather, 10.0));
        }
    } catch (error) {
        console.error('Error al clasificar la actividad:', error);
    }
  };
  

//Aqui boton de recomendación
  return (
    <div>
        <div className={`${styles.new_recommendation}`} onClick={cargarActividad} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faArrowRight} size="1x"/> 
        </div>
        
        <div className={`${styles.like_recommendation}`} onClick={!selected && seleccionarActividad(1)} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faThumbsUp} size="1x"/> 
        </div>

        <div className={`${styles.dislike_recommendation}`} onClick={!selected && seleccionarActividad(0)} style={{ cursor: 'pointer' }}>
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