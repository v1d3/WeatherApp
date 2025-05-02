import React, { useState } from "react";
import Recomendacion from "./recomendacion";
import styles from '../styles/user.module.css';

function TablaR() {
  const [mainTab, setMainTab] = useState(0);

  return (
    <div>
      <div className={`${styles.tabs}`}>
      <button className={`${styles['tab-button']} ${mainTab === 0 ? 'active' : ''}`}
        onClick={() => setMainTab(0)}
        onMouseEnter={() => console.log("hovered")} >Recomendacion </button>
        
        <button className={`${styles['tab-button']} ${mainTab === 1 ? "active" : ""}`}
        onClick={() => setMainTab(1)} 
        onMouseEnter={() => console.log("hovered")}>Planificación Personal </button>
      </div>

      <div >
        {mainTab === 0 && (
          <div>
            <p><Recomendacion/></p> 
          
          </div>
        )}
        {mainTab === 1 && <p>Contenido pestaña 2</p>}
      </div>
    </div>
  );
}

export default TablaR;