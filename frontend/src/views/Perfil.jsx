import React, { useState, useEffect } from 'react';
import Calendario from '../components/calendario';
function Perfil() {

  return (
    <div className="position-fixed" style={{ left: '22vw', bottom: '77vh' }}>
      <h1 className="display-4 fw-bold">¡Hola, X!</h1>

      <div className="position-fixed" style={{ left: '22vw', bottom: '5vh' }}>
        <p className="lead text-muted">Tu calendario de eventos</p>
        <hr></hr>
        <br></br>
        <Calendario />
      </div>
      
    </div>
  );
}

export default Perfil;
