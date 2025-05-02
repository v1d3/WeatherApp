import styles from '../styles/user.module.css';
import React, { useEffect, useState } from 'react';
import { getWeatherData } from '../services/user.js'; 

function ClimaActual() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const ClimaHoy = async () => {
            try {
                const datosObtenidos = await getWeatherData();
                setDatos(datosObtenidos);
            } catch (err) {
                setError(err.message);
            }
        };

        ClimaHoy();
    }, []);

    return (
        <div>
            <p className={styles.HOY}>HOY</p>
    
            <div className={styles.datosContainer}>
                {datos ? (
                    <>
                        <p className={styles.temperatura}>{datos.temperatura}°C</p>
                        <p className={styles.ciudad}>{datos.ciudad}</p>
                    </>
                ) : (
                    <p>Cargando clima...</p>
                )}
            </div>
        </div>
    );
    

}

export default  ClimaActual;