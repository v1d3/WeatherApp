import React, { useState, useEffect } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import { calendarService } from '../services/admin';
import 'dayjs/locale/es';

dayjs.locale('es'); 

function Calendario() {
  const localizer = dayjsLocalizer(dayjs);
  const [calendarEvents, setCalendarEvents] = useState([]);
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Obtener eventos del calendario del usuario
  const fetchUserCalendarEvents = async () => {
    try {
      const token = localStorage.getItem("calendarToken");
      if (!token) {
        return;
      }

      const username = extractUserIdFromToken(token);
      if (!username) {
        console.error("No se pudo obtener el ID de usuario");
        return;
      }
      
      // Usar el método getUserCalendars del calendarService
      const userCalendars = await calendarService.getUserCalendars(username);
      
      // Convertir a formato de eventos para el calendario
      const events = userCalendars.map(cal => ({
        id: cal.id,
        title: cal.activity ? cal.activity.name : 'Actividad',
        start: new Date(cal.timeInit),
        end: new Date(cal.timeInit + 3600000), // 1 hora de duración
        allDay: false,
        resource: {
          activityId: cal.activity?.id,
          weathers: cal.activity?.weathers,
          tags: cal.activity?.tags
        }
      }));
      
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error obteniendo eventos del calendario:', error);
    }
  };

  // Cargar eventos del usuario cuando se monta el componente
  useEffect(() => {
    fetchUserCalendarEvents();
  }, []);

  // Función para refrescar el calendario (puede ser llamada desde componentes padre)
  const refreshCalendar = () => {
    fetchUserCalendarEvents();
  };

  // Exponer la función de refresh para uso externo
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    refreshCalendar
  }));

  // Estilo para los eventos en el calendario
  const EventStyle = (event) => {
    // Puedes personalizar colores según el ID de actividad u otras propiedades
    const activityId = event.resource?.activityId;
    let backgroundColor = '#156DB5'; // Color por defecto
    
    // Ejemplo: asignar colores según el ID de la actividad
    if (activityId === 1) backgroundColor = '#28a745'; // Verde para actividad 1
    if (activityId === 2) backgroundColor = '#dc3545'; // Rojo para actividad 2
    
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
   const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Actual',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango.'
  };
  const mostrarNombre = ({ event }) => (
  <span title={event.title}>{event.title}</span>
);


  // Manejar eventos de selección para mostrar detalles
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  // Función para eliminar actividad del calendario
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setIsDeleting(true);
      
      // Eliminar del backend
      await calendarService.deleteCalendar(selectedEvent.id);
      
      // Actualizar el estado local
      setCalendarEvents(prevEvents => 
        prevEvents.filter(event => event.id !== selectedEvent.id)
      );
      
      // Cerrar modal
      setShowModal(false);
      setSelectedEvent(null);
      
      alert('Actividad eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      alert('Error al eliminar la actividad');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  return (
    <div style={{ height: '50vh', width: '40vw' }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        views={['month', 'agenda']}
        eventPropGetter={EventStyle}
        messages={messages}
        components={{ event: mostrarNombre }}
        onSelectEvent={handleSelectEvent}
      />

      {/* Modal para mostrar detalles de la actividad */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles de la Actividad</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                  disabled={isDeleting}
                ></button>
              </div>
              <div className="modal-body">
                {selectedEvent && (
                  <div>
                    <h6><strong>Actividad:</strong> {selectedEvent.title}</h6>
                    <p><strong>Fecha y hora:</strong> {selectedEvent.start.toLocaleString()}</p>
                    {selectedEvent.resource?.tags && selectedEvent.resource.tags.length > 0 && (
                      <div>
                        <strong>Tags:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {selectedEvent.resource.tags.map(tag => (
                            <span key={tag.id} className="badge bg-secondary rounded-pill">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={isDeleting}
                >
                  Cerrar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar Actividad'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendario;
