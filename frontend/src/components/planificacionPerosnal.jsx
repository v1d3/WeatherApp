import React, { useState, useEffect } from 'react';
import { activityService, calendarService } from '../services/admin';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/user.module.css';

function PlanificacionP() {
  const [activityNames, setActivityNames] = useState([]);
  const [formData, setFormData] = useState({
    activityId: '',
    dateTime: ''
  });

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

    } catch (error) {
      console.error('Error guardando calendario:', error.response || error.message || error);
      alert('Error al guardar la actividad: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="flex-grow-1 mx-auto w-100" style={{ maxWidth: '90%' }}>
        <div className="row mb-4 align-items-center">
          <div className="col-md-3 col-12">
            <label className="col-form-label">Actividad</label>
          </div>
          <div className="col-md-9 col-12">
            <select
              className="form-select"
              id="activityId"
              name="activityId"
              value={formData.activityId}
              onChange={handleInputChange}
            >
              <option value="">Seleccione actividad</option>
              {activityNames.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-4 align-items-center">
          <div className="col-md-3 col-12">
            <label className="col-form-label">Fecha y Hora</label>
          </div>
          <div className="col-md-9 col-12">
            <input
              className="form-control"
              id="dateTime"
              name="dateTime"
              type="datetime-local"
              value={formData.dateTime}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            className="btn text-white px-4 py-2"
            onClick={() => handleSaveCalendar()}
            style={{ 
              backgroundColor: '#156DB5',
              borderRadius: '10px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#156DB5')}
          >
            Guardar Actividad
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlanificacionP;
