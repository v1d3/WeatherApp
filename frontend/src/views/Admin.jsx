import React, { useState } from 'react';
import '../App.css';

function Admin() {
  const [clima, setClima] = useState('');
  const [fecha, setFecha] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const manejarEnvio = (e) => { 
    e.preventDefault();
    console.log('Datos enviados:');
    console.log('Clima:', clima);
    console.log('Fecha:', fecha);
    console.log('Ubicación:', ubicacion);

  };

  return (
    <div>
      <h1>Panel de Administración</h1>

      <form className="formulario" onSubmit={manejarEnvio}>
        
        <ul className='Lista_de_formulario'>
            <li>
                <label for="Clima_label" style={{marginRight:"48px"}}> Clima:</label>
                <input
                    id='Clima_label'
                    name='Clima_input'
                    type="text"
                    value={clima}
                    onChange={(e) => setClima(e.target.value)}
                    placeholder="Soleado, Lluvioso, etc." //Aqui de momento será así para agregar datos de prueba
                />
            </li>
            <li>
                <label for="Fecha_label" style={{marginRight:"48px"}}>Fecha:</label>
                    <input
                      id="Fecha_label"
                      name='Fecha_input'
                      type="datetime-local"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
            </li>
            <li>
                <label for="Ubicacion_label" style={{marginRight:"17px"}}>Ubicación:</label>         
                <input
                  id='Ubicacion_label'
                  name='Ubicacion_input'
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej: Concepción, Chile"
                />
            </li>
            <li>
                <label for="Actividades_label" style={{marginRight:"4px"}}>Actividades:</label>
                <input
                    id="Actividades_label"
                    name="Actividades_input"
                    type="text"
                    placeholder='Ej: Trotar, correr, ciclismo, etc.'
                />
            </li>
        </ul>
            
          
        <button type="submit">Guardar clima</button>
      </form>

    </div>
  );
}

export default Admin;
