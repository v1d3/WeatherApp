import React, { useState, useEffect } from 'react';
import { activityService } from '../services/admin';
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
        const selectedActivityId = e.target.value;
        setFormDataActivity({
            ...formDataActivity,
            name: selectedActivityId
        });

        console.log('Actividad seleccionada:', selectedActivityId, typeof selectedActivityId);
    };
    
    const handleInputChangeWeather = (e) => {
        const { name, value } = e.target;
        setFormDataWeather({
            ...formDataWeather,
            [name]: value
        });
    }

    useEffect(() => {
        const fetchActivityNames = async () => {
            try {
                const names = await activityService.getActivityNames();
                setActivityNames(names); 
            } catch (error) {
                console.error("Error al cargar nombres de la actividad:", error);
                alert(error.message);
            }
        };
        fetchActivityNames();
    }, []);

    return (
    <div className='vh-75 d-flex'>
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
                        {activityNames.map((name, index) => (
                            <option key={index} value={name}>
                                {name}
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
