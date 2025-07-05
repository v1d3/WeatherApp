import React, { useState } from 'react';
import { getActivities, updateActivityWeight } from '../services/user.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

function Recomendacion() {
  const [actividad, setActividad] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  const cargarActividad = async () => {
    try {
      setLoading(true);
      const resultado = await getActivities();
      setActividad(resultado);
      setSelected(false);
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      setActividad(null); // Asegurar que se muestre el mensaje si falla
    } finally {
      setLoading(false);
    }
  };

  const seleccionarActividad = async (val) => {
    try {
      setLoading(true);
      if (!actividad) throw new Error('No hay actividad para evaluar');

      const actividadActualizada = { ...actividad };
      const pesoActual = actividadActualizada.weight != null
        ? parseFloat(actividadActualizada.weight)
        : 1.0;

      let nuevoPeso = val === 1 ? pesoActual * 1.1 : pesoActual * 0.9;
      const pesoLimitado = Math.max(0.1, Math.min(nuevoPeso, 10.0));

      if (pesoLimitado >= 1.0) {
        try {
          const respuesta = await updateActivityWeight(actividadActualizada.id, pesoLimitado);
          if (respuesta?.weight != null) {
            actividadActualizada.weight = respuesta.weight;
          } else {
            actividadActualizada.weight = pesoLimitado;
          }
        } catch (error) {
          console.error(`Error al actualizar actividad (${val === 1 ? 'like' : 'dislike'}):`, error);
        }
      }

      if (val === 1) {
        setActividad(actividadActualizada);
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

  return (
    <div className="d-flex flex-column align-items-center" style={{ maxWidth: '28rem', margin: '0 auto', padding: '1rem' }}>
      {/* Tarjeta de recomendación */}
      <div className="card bg-gradient border-0 shadow-lg w-100 mb-4" 
           style={{ 
             background: 'linear-gradient(45deg, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
             borderRadius: '1rem',
             minHeight: '120px',
             border: '1px solid rgba(34, 211, 238, 0.3) !important'
           }}>
        <div className="card-body d-flex align-items-center justify-content-center text-center">
          {actividad ? (
            <p className="text-white fs-5 fw-medium mb-0">{actividad.name}</p>
          ) : loading ? (
            <p className="text-white-50 small mb-0">Cargando recomendación...</p>
          ) : (
            <p className="text-white-50 small mb-0">No hay una recomendación disponible</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="d-flex flex-column gap-3 w-100">
        <button
          onClick={cargarActividad}
          className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
          style={{ 
            background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
            border: 'none',
            borderRadius: '0.75rem',
            transition: 'all 0.3s ease'
          }}
        >
          <FontAwesomeIcon icon={faArrowRight} style={{ width: '1rem', height: '1rem' }} />
          <span>Siguiente</span>
        </button>

        <button
          onClick={() => seleccionarActividad(1)}
          disabled={selected}
          className={`btn btn-lg w-100 d-flex align-items-center justify-content-center gap-2 ${
            selected ? 'opacity-50' : ''
          }`}
          style={{ 
            background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
            border: 'none',
            borderRadius: '0.75rem',
            transition: 'all 0.3s ease',
            color: 'white',
            cursor: selected ? 'not-allowed' : 'pointer'
          }}
        >
          <FontAwesomeIcon icon={faThumbsUp} style={{ width: '1rem', height: '1rem' }} />
          <span>Me gusta</span>
        </button>

        <button
          onClick={() => seleccionarActividad(0)}
          disabled={selected}
          className={`btn btn-lg w-100 d-flex align-items-center justify-content-center gap-2 ${
            selected ? 'opacity-50' : ''
          }`}
          style={{ 
            background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
            border: 'none',
            borderRadius: '0.75rem',
            transition: 'all 0.3s ease',
            color: 'white',
            cursor: selected ? 'not-allowed' : 'pointer'
          }}
        >
          <FontAwesomeIcon icon={faThumbsDown} style={{ width: '1rem', height: '1rem' }} />
          <span>No me gusta</span>
        </button>
      </div>
    </div>
  );
}

export default Recomendacion;
