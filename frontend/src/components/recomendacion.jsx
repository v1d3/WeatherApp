import React, { useState } from 'react';
import { getActivities } from '../services/user.js'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/user.module.css';

function Recomendacion() {
  const [actividad, setActividad] = useState(null);
  const cargarActividad = async () => {
    try {
        const resultado = await getActivities();
        setActividad(resultado);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
    }
  };

  

//Aqui boton de recomendación
  return (
    <div>
        <div className={`${styles.new_recommendation}`} onClick={cargarActividad} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faArrowRight} size="1x"/> 
        </div>
        
        <div className={`${styles.like_recommendation}`} onClick={cargarActividad} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faThumbsUp} size="1x"/> 
        </div>

        <div className={`${styles.dislike_recommendation}`} onClick={cargarActividad} style={{ cursor: 'pointer' }}>
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