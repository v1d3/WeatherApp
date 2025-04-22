import { useState } from 'react';
import React, { useRef } from 'react';
import './App.css';
import User from './views/User'; 
import axios from 'axios';
import login from './services/login.js';

function App() {
  const [mostrarUser, actualizar_mU] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ingresar, setLogin] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleLogin = async() => {
    const user =  await login(username, password);
    window.localStorage.setItem('UserLoged', JSON.stringify(user));
  }

  return (
    <>
      <div>
        <span>{"Ingrese usuario: "}</span>
        <input
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />
        <br></br>
        <span>{"Ingrese contraseña: "}</span>
        <span className='p-2' onClick={() => setVisible(!visible)}>{visible?'◡':'👁'}</span>
        <span>{"  "}</span>
        <input
          type={visible ? "text" : "password"}
          value={password}
          onChange={(c) =>
            setPassword(c.target.value)
          }
        />
        <br></br>
        <button className="button" onClick={handleLogin}>Ingresar</button>
      </div>
      <br></br>
      <div>
        {mostrarUser ? (<User />) : (
          <button className="button" onClick={() => actualizar_mU(true)}>Clima</button>
        )}
      </div>
    </>
  );
}


export default App;
