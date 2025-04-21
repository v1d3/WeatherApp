import { useState } from 'react';
import './App.css';
import User from './views/User'; 

function App() {
  const [mostrarUser, actualizar_mU] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ingresar, setLogin] = useState(false)

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
        <input
          value={password}
          onChange={(c) =>
            setPassword(c.target.value)
          }
        />
        <br></br>
        <button className="button" onClick={() => setLogin(true)}>Ingresar</button>
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
