import React, { useState, useEffect } from "react";
import Recomendacion from "./recomendacion";
import styles from '../styles/user.module.css';
import classNames from 'classnames';
import PlanificacionP from '../components/planificacionPerosnal';
import { getAllActivities } from '../services/user'; // Import the correct service function

function TablaR() {
  const [mainTab, setMainTab] = useState(0);
  const [extraTab, setRecTab] = useState(0);
  const [activities, setActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (extraTab === 1) {
      setLoading(true);
      // Use the imported service function instead of direct fetch
      getAllActivities()
        .then(data => {
          setActivities(data);
          setError(null);
        })
        .catch(err => {
          console.error("Error fetching activities:", err);
          setError("Error al cargar actividades");
          setActivities([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [extraTab]);

  return (
    <div>
      <div className={styles.tabs}>
        <button
          className={classNames(styles['tab-button'], { [styles.active]: mainTab === 0 })}
          onClick={() => setMainTab(0)}
          onMouseEnter={() => console.log("hovered")}
        >
          Recomendacion
        </button>
        <button
          className={classNames(styles['tab-button'], { [styles.active]: mainTab === 1 })}
          onClick={() => setMainTab(1)}
          onMouseEnter={() => console.log("hovered")}
        >
          Planificación Personal
        </button>
      </div>

      <div>
        {mainTab === 0 && (
          extraTab === 0 ? (
            <div>
              <Recomendacion />
              {/* Move the buttons below Recomendacion */}
              <div className={styles.tabs} style={{ marginTop: '15.5vw'}}>
                
                <button
                style={{ marginLeft: '10vw' }}
                  className={classNames(styles['listButton'], { [styles.active]: extraTab === 1 })}
                  onClick={() => setRecTab(1)}
                  onMouseEnter={() => console.log("hovered")}
                >
                  Ver lista
                </button>
              </div>
            </div>
          ) : (
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
                    onMouseEnter={() => console.log("hovered")}
                  >
                    Volver
                  </button>
                </div>
            </div>
          )
        )}
        {mainTab === 1 &&  <div>
            <PlanificacionP />
          </div>}
      </div>
    </div>
  );
}

export default TablaR;