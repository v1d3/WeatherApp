import React, { useState, useEffect } from 'react';
import { getActivities, updateActivityWeight } from '../services/user.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import UsefulRecommendation from '../components/usefulRecommendation';

function Recomendacion({ ciudadSeleccionada }) {
  const [actividad, setActividad] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar actividad al inicio
  useEffect(() => {
    cargarActividad();
  }, []);

  const cargarActividad = async () => {
    try {
      setLoading(true);
      const resultado = await getActivities();
      setActividad(resultado);
      setSelected(false);
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      setActividad(null);
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
    <div className="w-full max-w-md mx-auto mt-6 space-y-4 px-4">
      {/* Tarjeta de recomendación */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-400/30 min-h-[120px] flex items-center justify-center text-center shadow-md">
        {actividad ? (
          <p className="text-white font-medium text-lg">{actividad.name}</p>
        ) : loading ? (
          <p className="text-white/70 text-sm">Cargando recomendación...</p>
        ) : (
          <p className="text-white/70 text-sm">No hay una recomendación disponible</p>
        )}
      </div>

      {/* Componente UsefulRecommendation */}
        <UsefulRecommendation ciudadSeleccionada={ciudadSeleccionada} activity={actividad} />
      

      {/* Botones */}
      <div className="space-y-3">
        <button
          onClick={cargarActividad}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
          <span>Siguiente</span>
        </button>

        <button
          onClick={() => seleccionarActividad(1)}
          disabled={selected}
          className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            selected ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FontAwesomeIcon icon={faThumbsUp} className="w-4 h-4" />
          <span>Me gusta</span>
        </button>

        <button
          onClick={() => seleccionarActividad(0)}
          disabled={selected}
          className={`w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            selected ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FontAwesomeIcon icon={faThumbsDown} className="w-4 h-4" />
          <span>No me gusta</span>
        </button>
      </div>
    </div>
  );
}

export default Recomendacion;