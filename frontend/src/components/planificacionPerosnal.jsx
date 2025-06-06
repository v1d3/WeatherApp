import React, { useState, useEffect } from 'react';
import { activityService, calendarService } from '../services/admin';
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
      const result = await calendarService.createCalendar(calendarData, token);
      
      alert('Actividad guardada correctamente');

    } catch (error) {
      console.error('Error guardando calendario:', error.response || error.message || error);
      alert('Error al guardar la actividad: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
    }
  };

  return (
    <div className="vh-75 d-flex">
      <div className="col-12 col-sm-11 col-md-9 col-xl-6 m-auto" style={{ maxWidth: '50%' }}>
        <div className="row mb-3 align-items-center">
          <div className="col-3">
            <label className="col-form-label mt-5">Actividad</label>
          </div>
          <div className="col-9">
            <select
              className="form-select form-select-sm ms-5 w-100 mt-5"
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

        <div className="row mb-3 align-items-center">
          <div className="col-3">
            <label className="col-form-label mt-1 text-nowrap">Fecha y Hora</label>
          </div>
          <div className="col-9">
            <input
              className="form-control form-control-sm ms-5 w-100"
              id="dateTime"
              name="dateTime"
              type="datetime-local"
              value={formData.dateTime}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <button
          className={`middle ${styles.guardarActividad}`}
          onClick={handleSaveCalendar}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#156DB5')}
        >
          Guardar Actividad
        </button>
      </div>
    </div>
  );
}

export default PlanificacionP;
