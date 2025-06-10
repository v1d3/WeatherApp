import React, { useState, useEffect } from 'react';
import Calendario from '../components/calendario';

function Perfil() {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    // Intentar obtener el nombre desde localStorage primero
    const nombreGuardado = localStorage.getItem('userName');

    if (nombreGuardado) {
      setNombre(nombreGuardado);
    } else {
      // Si no está disponible, intentar obtenerlo del token
      const token = localStorage.getItem('weatherToken') ||
        localStorage.getItem('activityToken') ||
        localStorage.getItem('calendarToken');

      if (token) {
        try {
          // Decodificar el token
          const tokenPayload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(tokenPayload));

          // Buscar nombre o username en campos comunes del JWT
          // Buscar en diferentes posibles ubicaciones del payload
          const nombreUsuario = decodedPayload.name ||
            decodedPayload.username ||
            decodedPayload.sub ||
            decodedPayload.userId ||
            decodedPayload.id ||
            'Usuario';

          setNombre(nombreUsuario);
        } catch (error) {
          console.error("Error decodificando token:", error);
          setNombre('Usuario');
        }
      }
    }
  }, []);

  return (
    <div className="position-fixed" style={{ left: '22vw', bottom: '77vh' }}>
      <h1 className="display-7 fw-bold">¡Hola, <span style={{ color: '#156db5' }}>{nombre}</span>!</h1>

      <div className="position-fixed" style={{ left: '22vw', bottom: '5vh' }}>
        <p className="lead text-muted fw-semibold">Planificación personal</p>
        <hr />
        <br />
        <Calendario />
      </div>
    </div>
  );
}

export default Perfil;
