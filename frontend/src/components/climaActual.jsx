import styles from '../styles/user.module.css';
import React, { useEffect, useState } from 'react';
import UserService from '../services/user.js';

function ClimaActual() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState(null);
    const [fechaHora, setFechaHora] = useState('');

    const formatearFecha = (fechaString) => {
        try {
            const fecha = new Date(fechaString);

            const meses = [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ];

            const dia = fecha.getDate();
            const mes = meses[fecha.getMonth()];

            let hora = fecha.getHours();
            let ampm = hora >= 12 ? 'pm' : 'am';
            hora = hora % 12;
            hora = hora ? hora : 12;

            return `${dia} de ${mes}, ${hora}${ampm}`;
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
            return 'Fecha no disponible';
        }
    };

    useEffect(() => {
        const actualizarDatos = async () => {
            try {
                const datosObtenidos = await UserService.getWeatherData();
                setDatos(datosObtenidos);

                if (datosObtenidos && datosObtenidos.clima && datosObtenidos.clima[0]) {
                    const fechaUTC = datosObtenidos.clima[0].dateTime;
                    const opciones = { timeZone: 'America/Santiago' };

                    const fechaLocal = fechaUTC.toLocaleString('es-CL', opciones);
                    console.log('Fecha local:', fechaLocal);
                    const fechaFormateada = formatearFecha(fechaLocal);
                    setFechaHora(fechaFormateada);
                }
            } catch (err) {
                console.error('Error al actualizar datos:', err);
                setError(err.message);
            }
        };

        actualizarDatos();

        const intervaloTiempo = setInterval(() => {
            actualizarDatos();
        }, 3600000);

        return () => clearInterval(intervaloTiempo);
    }, []);

    return (
        <div>
            <div className={styles.datosContainer}>
                {datos ? (
                    <>
                        <p className={styles.fechaHora}>{fechaHora}</p>

                        <p className={styles.temperatura}>
                            {datos.clima && datos.clima[0] && datos.clima[0].temperature
                                ? `${datos.clima[0].temperature}°C`
                                : 'N/A'}
                        </p>

                        <div className={styles.detallesClima}>
                            <p className={styles.detalle}>
                                <span className={styles.detalleLabel}>Humedad:</span>
                                {datos.clima && datos.clima[0] && datos.clima[0].humidity
                                    ? `${datos.clima[0].humidity}%`
                                    : 'N/A'}
                            </p>

                            <p className={styles.detalle}>
                                <span className={styles.detalleLabel}>Viento:</span>
                                {datos.clima && datos.clima[0] && datos.clima[0].windSpeed
                                    ? `${datos.clima[0].windSpeed} km/h`
                                    : 'N/A'}
                            </p>

                            <p className={styles.ciudad}>
                                {datos.ciudad || 'N/A'}
                            </p>
                        </div>
                    </>
                ) : (
                    <p>Cargando clima...</p>
                )}
            </div>
        </div>
    );
}

export default ClimaActual;