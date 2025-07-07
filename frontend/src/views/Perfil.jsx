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
    <main className='d-flex flex-column h-100'>
      <h1 className="fw-bold text-white">¡Hola, <span style={{ color: '#22d3ee' }}>{nombre}</span>!</h1>

      <p className="mt-4 lead fw-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>Planificación personal</p>
      <hr style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} />
      <div className='flex-fill col-12 col-sm-11 col-lg-9 col-xl-7 m-auto ' style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '1rem',
        padding: '1rem',
      }}>
        <Calendario />
      </div>
    </main>
  );
}

export default Perfil;
