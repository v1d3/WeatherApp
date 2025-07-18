import React, { useState, useEffect } from 'react';
import { calendarService } from '../services/admin';
import activityService from '../services/activity';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from "react-select";  // Asegúrate de importar Select

function PlanificacionP() {
  const [activityNames, setActivityNames] = useState([]);
  const [formData, setFormData] = useState({
    activityId: '',
    dateTime: ''
  });

  // Añadir estado para mostrar tags de la actividad seleccionada
  const [selectedActivityTags, setSelectedActivityTags] = useState([]);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si es el campo de actividad, buscar sus tags
    if (name === "activityId" && value) {
      const activity = activityNames.find(a => a.id === parseInt(value));
      setSelectedActivityTags(activity?.tags || []);
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Cargar actividades al iniciar el componente
  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        const activities = await activityService.getAllActivities();
        setActivityNames(activities);
      } catch (error) {
        console.error('Error al cargar actividades:', error);
        alert('Error al cargar actividades');
      }
    };
    fetchAllActivities();
  }, []);

  // Extraer userId del token JWT
  const extractUserIdFromToken = (token) => {
    try {
      const tokenPayload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(tokenPayload));

      // Buscar userId en campos comunes del JWT
      let userId = decodedPayload.userId || decodedPayload.sub || decodedPayload.id;

      // Convertir a número si es una cadena numérica
      if (userId && typeof userId === 'string' && !isNaN(userId)) {
        userId = parseInt(userId, 10);
      }

      return userId;
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  };

  // Validar los datos del formulario
  const validateFormData = (selectedActivity, dateInput, userId) => {
    if (!selectedActivity) {
      alert("Actividad inválida");
      return false;
    }

    if (isNaN(dateInput.getTime())) {
      alert("Por favor, selecciona una fecha válida.");
      return false;
    }

    if (dateInput <= new Date()) {
      alert("Por favor, selecciona una fecha futura.");
      return false;
    }

    if (!userId) {
      alert("No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.");
      return false;
    }

    return true;
  };

  // Guardar la actividad en el calendario
  const handleSaveCalendar = async () => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem("calendarToken");
      if (!token) {
        alert("Necesitas iniciar sesión para guardar actividades");
        return;
      }

      // Extraer ID de usuario del token
      const userId = extractUserIdFromToken(token);

      // Buscar la actividad seleccionada
      const activityId = parseInt(formData.activityId, 10);
      const selectedActivity = activityNames.find(a => a.id === activityId);

      // Preparar fecha
      const dateInput = new Date(formData.dateTime);

      // Validar datos
      if (!validateFormData(selectedActivity, dateInput, userId)) {
        return;
      }

      // Preparar datos para la API
      const calendarData = {
        timestamp: dateInput.getTime(),
        activity_id: selectedActivity.id,
        username: userId
      };

      // Enviar datos al servidor
      const result = await calendarService.createCalendar(calendarData);

      alert('Actividad guardada correctamente');

      // Limpiar el formulario después de guardar
      setFormData({
        activityId: '',
        dateTime: ''
      });
      setSelectedActivityTags([]);

    } catch (error) {
      console.error('Error guardando calendario:', error.response || error.message || error);
      
      // Extraer el mensaje de error del servidor
      let errorMessage = 'Error al guardar la actividad';
      
      if (error.response && error.response.data) {
        // Si el servidor devuelve un mensaje específico
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSaveCalendar();
      }}>
        <div className="mb-2">
          <label htmlFor="activityId" className="form-label" style={{ color: 'white', fontWeight: '500', fontSize: '0.875rem' }}>Actividad</label>
          <select
            className="form-select form-select-sm"
            id="activityId"
            name="activityId"
            value={formData.activityId}
            onChange={handleInputChange}
            required
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="" style={{ color: 'black' }}>Seleccione actividad</option>
            {activityNames.map((activity) => (
              <option key={activity.id} value={activity.id} style={{ color: 'black' }}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mostrar tags de la actividad seleccionada */}
        {selectedActivityTags.length > 0 && (
          <div className="mb-2">
            <label className="form-label" style={{ color: 'white', fontWeight: '500', fontSize: '0.875rem' }}>Tags:</label>
            <div className="d-flex flex-wrap gap-1">
              {selectedActivityTags.map(tag => (
                <span
                  key={tag.id}
                  className="badge bg-secondary rounded-pill"
                  style={{ fontSize: '0.625rem' }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-2">
          <label htmlFor="dateTime" className="form-label" style={{ color: 'white', fontWeight: '500', fontSize: '0.875rem' }}>Fecha y hora</label>
          <input
            type="datetime-local"
            className="form-control form-control-sm"
            id="dateTime"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleInputChange}
            required
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-sm w-100" style={{  fontSize: '0.875rem' ,  background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',    border: 'none',    borderRadius: '0.5rem',    transition: 'all 0.3s ease',    color: 'white',    cursor: 'pointer',    padding: '0.375rem 0.75rem'}}>
          Guardar Actividad
        </button>
      </form>
    </div>
  );
}

export default PlanificacionP;
