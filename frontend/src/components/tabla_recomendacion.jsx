import React, { useState, useEffect, useRef } from "react";
import Recomendacion from "./recomendacion";
import styles from '../styles/user.module.css';
import classNames from 'classnames';
import PlanificacionP from '../components/planificacionPerosnal';
import { getFilteredActivities } from '../services/user'; // Importar la nueva función

function TablaR() {
  const [mainTab, setMainTab] = useState(0);
  const [extraTab, setRecTab] = useState(0);
  const [activities, setActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(59); // duración en segundos, editable
  const [duration, setDuration] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: selectedDuration,
  });
  const recomendacionRef = useRef();
  const username = JSON.parse(JSON.parse(localStorage.getItem('UserLoged'))['config']['data'])['username']; // O de tu contexto/autenticación
  //console.log("Usuario dentro de Tabla_recomendacion: ", username, " - ", typeof(username))

  useEffect(() => {
    if (localStorage.getItem(`actividadActual_${username}`)) {
      console.log("Añadiendo actividad: ", localStorage.getItem(`actividadActual_${username}`))
      activities.push(localStorage.getItem(`actividadActual_${username}`))
    }
    if (extraTab === 1) {
      setLoading(true);
      // Usar la nueva función que filtra por condiciones climáticas
      getFilteredActivities()
        .then(data => {
          setActivities(data);
          setError(null);
        })
        .catch(err => {
          console.error("Error fetching filtered activities:", err);
          setError("Error al cargar actividades recomendables");
          setActivities([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [extraTab]);

  // Actualiza el estado y el valor total en segundos
  const handleDurationChange = (field, value) => {
    const newDuration = { ...duration, [field]: Number(value) };
    setDuration(newDuration);
    // Calcula el total en segundos y actualiza selectedDuration
    const totalSeconds =
      newDuration.days * 86400 +
      newDuration.hours * 3600 +
      newDuration.minutes * 60 +
      newDuration.seconds;
    setSelectedDuration(totalSeconds);
  };

  return (
    <div>
      <div className={styles.tabs}>
        <button
          className={classNames(styles['tab-button'], { [styles.active]: mainTab === 0 })}
          onClick={() => setMainTab(0)}
          onMouseEnter={() => console.log("hovered_recomend")}
        >
          Recomendacion
        </button>
        <button
          className={classNames(styles['tab-button'], { [styles.active]: mainTab === 1 })}
          onClick={() => setMainTab(1)}
          onMouseEnter={() => console.log("hovered_personalPlanification")}
        >
          Planificación Personal
        </button>
      </div>

      <div>
        {mainTab === 0 && (
            <>
              <Recomendacion
                ref={recomendacionRef}
                username={username}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                onSeleccionarActividadExitosa={() => setRecTab(2)}
                style={{ display: extraTab === 0 ? 'block' : 'none' }}
              />
          {extraTab === 0 ? (
            <div>
              {/*}
              <Recomendacion
                ref={recomendacionRef}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                onSeleccionarActividadExitosa={() => setRecTab(2)}
              />
              {/* Move the buttons below Recomendacion */}
              <div className={styles.tabs} style={{ marginTop: '15.5vw'}}>
                
                <button
                  style={{ marginLeft: '10vw' }}
                  className={classNames(styles['listButton'], { [styles.active]: extraTab === 1 })}
                  onClick={() => setRecTab(1)}
                  onMouseEnter={() => console.log("hovered_options")}
                >
                  Ver opciones disponibles
                </button>
              </div>
            </div>
          ) : ( extraTab === 1 ? (
            <div>
              <ul className={`${styles.list_activities}`}>
                {activities.length === 0 ? (
                  <li>No hay actividades registradas.</li>
                ) : (
                  activities.map((activity) => (
                    <li
                      key={activity.id}
                      onClick={() => setSelectedActivityId(activity.id)}
                      style={{
                        backgroundColor: selectedActivityId === activity.id ? "#DAEEFE" : "transparent",
                        cursor: "pointer"
                      }}
                    >
                      {activity.name}
                    </li>
                  ))
                )}
              </ul>
              <div className={styles.tabs} style={{ marginTop: '15.5vw'}}>
                  <button
                  style={{ marginLeft: '10vw' }}
                    className={classNames(styles['listButton'], { [styles.active]: extraTab === 1 })}
                    onClick={() => setRecTab(0)}
                    onMouseEnter={() => console.log("hovered_back")}
                  >
                    Volver
                  </button>
                </div>
            </div>
            ) : (
              <div>
                {extraTab === 2 && (
                  <div style={{ marginTop: '5vw', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Defina el tiempo deseado</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="0"
                        value={duration.days}
                        onChange={e => handleDurationChange('days', e.target.value)}
                        style={{ width: '40px', textAlign: 'center' }}
                        placeholder="DD"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={duration.hours}
                        onChange={e => handleDurationChange('hours', e.target.value)}
                        style={{ width: '40px', textAlign: 'center' }}
                        placeholder="HH"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={duration.minutes}
                        onChange={e => handleDurationChange('minutes', e.target.value)}
                        style={{ width: '40px', textAlign: 'center' }}
                        placeholder="MM"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={duration.seconds}
                        onChange={e => handleDurationChange('seconds', e.target.value)}
                        style={{ width: '40px', textAlign: 'center' }}
                        placeholder="SS"
                      />
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#888' }}>
                      Días : Horas : Minutos : Segundos
                    </div>
                  </div>
                )}
                <div
                  className={styles.tabs}
                  style={{
                    marginTop: '5.5vw',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <button
                    style={{ marginLeft: 50 }}
                    className={classNames(styles['listButton'], { [styles.active]: extraTab === 1 })}
                    onClick={async () => {
                      console.log("Intentando llamar seleccionarActividadLike", recomendacionRef.current);
                      if (recomendacionRef.current) {
                        await recomendacionRef.current.seleccionarActividadLike();
                      }else {
                        console.log("El ref no está disponible o la función no existe");
                      }
                      setRecTab(0);
                    }}
                    onMouseEnter={() => console.log("hovered_selectActivity")}
                  >
                    Seleccionar
                  </button>
                  <button
                    style={{ marginRight: 50 }}
                    className={classNames(styles['listButton'], { [styles.active]: extraTab === 1 })}
                    onClick={() => setRecTab(0)}
                    onMouseEnter={() => console.log("hovered_back")}
                  >
                    Volver
                  </button>
                </div>
              </div>
            )
          )}
          </>
        )}
        {mainTab === 1 &&  <div>
            <PlanificacionP />
          </div>}
      </div>
    </div>
  );
}

export default TablaR;