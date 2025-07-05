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
    <div style={{ padding: '1rem 0' }}>
      <h1 className="display-7 fw-bold text-white">¡Hola, <span style={{ color: '#22d3ee' }}>{nombre}</span>!</h1>

      <div style={{ marginTop: '2rem' }}>
        <p className="lead fw-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>Planificación personal</p>
        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} />
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          padding: '1rem',
          width: 'fit-content',
          maxWidth: '100%'
        }}>
          <Calendario />
        </div>
      </div>
    </div>
  );
}

export default Perfil;
