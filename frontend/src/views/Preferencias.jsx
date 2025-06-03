import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/user.module.css';
import { activityService } from '../services/admin';
 
function Preferencias() {
  const [activityNames, setActivityNames] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  useEffect(() => {
    const fetchActivityNames = async () => {
      try {
        const names = await activityService.getActivityNames();
        setActivityNames(names);
      } catch (error) {
        console.error('Error al cargar nombres de la actividad:', error);
        alert(error.message);
      }
    };
    fetchActivityNames();
  }, []);

  const handleCheckboxChange = (e) => {
    const activityName = e.target.value;
    if (e.target.checked) {
      setSelectedActivities([...selectedActivities, activityName]);
    } else {
      setSelectedActivities(selectedActivities.filter(name => name !== activityName));
    }
  };

  const handleSave = () => {
    console.log('Actividades seleccionadas:', selectedActivities);
  };

  return (
    <div>
      <h2>Actividades preferidas </h2>
      <hr />
      
      <div className={`d-flex flex-column align-items-center p-3 mx-auto ${styles.cuadroPreferencias}`}>
        {activityNames.map((name, index) => (
          <div
            key={index}
            className="card shadow-sm rounded mb-3"
            style={{ width: '100%', maxWidth: '76vw', height: '50px' }}
          >
            <div className="card-body d-flex align-items-center justify-content-between p-0 px-3">
              <p className="fs-6 fw-normal mb-0">{name}</p>
              <input 
                type="checkbox" 
                className={`middle ${styles.check}`}
                id={`activity-${index}`} 
                value={name}
                checked={selectedActivities.includes(name)}
                onChange={handleCheckboxChange}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        className={`middle ${styles.guardarPreferencias}`}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#4A95D3')}
      >
        Guardar
      </button>
    </div>
  );
};

export default Preferencias;
