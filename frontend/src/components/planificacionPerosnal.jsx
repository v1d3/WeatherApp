import React, { useState, useEffect } from 'react';
import { activityService,calendarService } from '../services/admin'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/user.module.css';

function PlanificacionP() {
    const [activityNames, setActivityNames] = useState([]); 
    
    const [formDataWeather, setFormDataWeather] = useState({
      dateTime: ''
    });
  
    const [formDataActivity, setFormDataActivity] = useState({
      name: ''
    });
  
    const handleActivityChange = (e) => {
      setFormDataActivity({
        ...formDataActivity,
        name: e.target.value 
      });
    };
  
    const handleInputChangeWeather = (e) => {
      const { name, value } = e.target;
      setFormDataWeather({
        ...formDataWeather,
        [name]: value
      });
    };

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

    const handleSaveCalendar = async () => {
      try {
        // Check for auth token first
        const token = localStorage.getItem("calendarToken");
        if (!token) {
          alert("Necesitas iniciar sesión para guardar actividades");
          // Optionally redirect to login page
          // window.location.href = '/login';
          return;
        }
        
        console.log("Id actividad seleccionada:", formDataActivity.name);
        console.log("Lista de actividades:", activityNames);

        const selectedActivity = activityNames.find(
          (a) => a.id === parseInt(formDataActivity.name, 10)
        );

        // Comprueba en consola
        console.log("Actividad seleccionada:", selectedActivity);
        console.log("ID de actividad:", selectedActivity.id);

        if (!selectedActivity) {
          alert("Actividad inválida");
          return;
        }

        const dateInput = new Date(formDataWeather.dateTime);
        if (isNaN(dateInput.getTime())) {
          alert("Por favor, selecciona una fecha válida.");
          return;
        }
        if (dateInput <= new Date()) {
          alert("Por favor, selecciona una fecha futura.");
          return;
        }

        const calendarData = {
          timeInit: dateInput.getTime(),
          activity: {
            id: selectedActivity.id,
            // Si es necesario, incluye más propiedades de la actividad
            name: selectedActivity.name  // Esto podría ser necesario
          },
          userEntity: {
            id: parseInt(localStorage.getItem('userId'), 10)
            // Otros campos de usuario si son necesarios
          }
        };

        console.log("Payload enviado:", calendarData);

        const result = await calendarService.createCalendar(calendarData);

        alert('Actividad guardada correctamente con id: ' + result.calendar_id);

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
              id="name"
              name="name"
              value={formDataActivity.name}
              onChange={handleActivityChange}
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
              value={formDataWeather.dateTime}
              onChange={handleInputChangeWeather}
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
