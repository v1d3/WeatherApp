import React, { useState, useEffect } from 'react';
import { activityService, calendarService } from '../services/admin';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/user.module.css';

function PlanificacionP() {
  const [activityNames, setActivityNames] = useState([]);
  const [formData, setFormData] = useState({
    activityId: '',
    dateTime: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);

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
      
      // Actualizar el calendario después de guardar
      fetchUserCalendarEvents();

    } catch (error) {
      console.error('Error guardando calendario:', error.response || error.message || error);
      alert('Error al guardar la actividad: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
    }
  };

  // Obtener eventos del calendario del usuario
  const fetchUserCalendarEvents = async () => {
    try {
      const token = localStorage.getItem("calendarToken");
      if (!token) {
        return;
      }

      const username = extractUserIdFromToken(token);
      
      // Usar el método getUserCalendars que ya tienes definido en calendarService
      const userCalendars = await calendarService.getUserCalendars(username);
      
      // Convertir a formato de eventos para el calendario
      const events = userCalendars.map(cal => ({
        id: cal.id,
        title: cal.activity ? cal.activity.name : 'Actividad',
        start: new Date(cal.timeInit),
        end: new Date(cal.timeInit + 3600000), // Asumimos 1 hora de duración
        allDay: false,
        // Puedes añadir información adicional para mostrarla en tooltips o similar
        resource: {
          activityId: cal.activity?.id,
          weathers: cal.activity?.weathers
        }
      }));
      
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error obteniendo eventos del calendario:', error);
    }
  };

  // Cargar eventos del calendario al abrir el modal
  const handleOpenCalendar = () => {
    fetchUserCalendarEvents();
    setShowModal(true);
  };

  // Configuración del localizador para el calendario
  const localizer = dayjsLocalizer(dayjs);

  // Estilo para los eventos en el calendario con colores según la actividad
  const eventStyleGetter = (event) => {
    // Puedes crear una lógica para asignar colores según el ID de actividad o alguna otra propiedad
    const activityId = event.resource?.activityId;
    let backgroundColor = '#156DB5'; // Color por defecto
    
    // Ejemplo: asignar colores según el ID de la actividad
    if (activityId === 1) backgroundColor = '#28a745'; // Verde para actividad 1
    if (activityId === 2) backgroundColor = '#dc3545'; // Rojo para actividad 2
    // etc.
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        color: 'white',
        border: 'none',
        padding: '2px 6px'
      }
    };
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

        {/* Botón de calendario */}
        <div className="text-center mt-3 mb-2">
          <button
            className="btn text-white"
            onClick={handleOpenCalendar}
            style={{ 
              backgroundColor: '#156DB5',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto'
            }}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
          </button>
          <small className="d-block mt-1 text-muted">Ver calendario</small>
        </div>

        <div className="text-center mt-3 mb-3">
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

      {/* Modal para mostrar el calendario */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: '#156DB5', color: 'white' }}>
          <Modal.Title>Mi Calendario de Actividades</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ height: '500px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              views={['month', 'week', 'day']}
              eventPropGetter={eventStyleGetter}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowModal(false)}
          >
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PlanificacionP;
