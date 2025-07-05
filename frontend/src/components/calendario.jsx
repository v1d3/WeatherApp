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
        end: new Date(cal.timeInit + 3600000), // Asumimos 1 hora de duración
        allDay: false,
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

  // Cargar eventos del usuario cuando se monta el componente
  useEffect(() => {
    fetchUserCalendarEvents();
  }, []);

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


  return (
    <div style={{ height: '50vh', width: '40vw' }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        views={['month', 'agenda']}
        eventPropGetter={EventStyle}
        messages={messages}
        components={{ event: mostrarNombre }}
      />
    </div>
  );
}

export default Calendario;
