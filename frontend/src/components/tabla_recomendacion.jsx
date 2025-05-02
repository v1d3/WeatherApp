import React, { useState } from "react";
import Recomendacion from "./recomendacion";
import styles from '../styles/user.module.css';
import classNames from 'classnames';

function TablaR() {
  const [mainTab, setMainTab] = useState(0);

  return (
    <div>
      <div className={`${styles.tabs}`}>
        <button className={classNames(styles['tab-button'], { [styles.active]: mainTab === 0 })}
          onClick={() => setMainTab(0)}
          onMouseEnter={() => console.log("hovered")} >Recomendacion </button>

        <button className={classNames(styles['tab-button'], { [styles.active]: mainTab === 1 })}
          onClick={() => setMainTab(1)}
          onMouseEnter={() => console.log("hovered")}>Planificación Personal </button>
      </div>

      <div >
        {mainTab === 0 && (
          <div>
            <Recomendacion />
          </div>
        )}
        {mainTab === 1 && <p>Contenido pestaña 2</p>}
      </div>
    </div>
  );
}

export default TablaR;