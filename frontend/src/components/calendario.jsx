import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';

function Calendario() {
  const localizer = dayjsLocalizer(dayjs);

  const eventos = [
    {
      start: dayjs('2025-06-02T11:00:00').toDate(),
      end: dayjs('2025-06-03T11:00:00').toDate(),
      title: 'Evento 2'
    }
  ];

  const EventStyle = () => {
    return {
      style: {
        backgroundColor: '#156DB5', 
        borderRadius: '6px',
        color: 'white',
        border: 'none',
        padding: '2px 6px'
      }
    };
  };

  return (
    <div style={{ height: '50vh', width: '40vw' }}>
      <Calendar
        localizer={localizer}
        events={eventos}
        views={['month', 'agenda']}
        eventPropGetter={EventStyle}
      />
    </div>
  );
}

export default Calendario;
