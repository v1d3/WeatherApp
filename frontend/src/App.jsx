import React, { useState } from 'react';
import './App.css';
import User from './views/User'; 
import login from './services/login.js';

function App() {
  const [mostrarUser, actualizar_mU] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [userLogin, setUserLogin] = useState(false);

  const handleLogin = async() => {
    try{
      const user =  await login(username, password);
      if(user != null){
        window.localStorage.setItem('UserLoged', JSON.stringify(user));
        setUserLogin(true);
        setUsername("");
        setPassword("");

      } 
      else setError("Usuario o contraseña incorrectos.");
    }catch(e){
      console.log("ERROR: ", e);
    }
    
  }

  const logOut = async() => {

    if (localStorage.getItem('UserLoged')) {
      console.log("Borrando usuario logeado:", JSON.parse(localStorage.getItem('UserLoged')));
      localStorage.removeItem('UserLoged');
      setUserLogin(false);
    } else {
      console.log("No hay usuario logeado.");
    }
  }

  return (
    <>
      <div>
        {!userLogin ?(<>
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
        <button className="button" onClick={handleLogin}>Log In</button></>):
        (<button className="button" onClick={logOut}>Log Out</button>)
        }
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
