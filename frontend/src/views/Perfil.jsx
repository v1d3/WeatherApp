import React, { useState, useEffect } from 'react';
import Calendario from '../components/calendario';

function Perfil() {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const nombreGuardado = localStorage.getItem('userName');
    if (nombreGuardado) {
      setNombre(nombreGuardado);
    }
  }, []);

  return (
    <div className="position-fixed" style={{ left: '22vw', bottom: '77vh' }}>
      <h1 className="display-7 fw-bold">¡Hola, {nombre }!</h1>

      <div className="position-fixed" style={{ left: '22vw', bottom: '5vh' }}>
        <p className="lead text-muted">Tu calendario de eventos</p>
        <hr />
        <br />
        <Calendario />
      </div>
    </div>
  );
}

export default Perfil;
