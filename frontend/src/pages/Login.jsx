import fondo from "../assets/fondo_login.png";
import React, { useState } from 'react';
import '../App.css';
import User from '../views/User'; 
import login from '../services/login.js';
import {jwtDecode} from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCircleUser } from '@fortawesome/free-solid-svg-icons';
function Login(){
    const [mostrarUser, actualizar_mU] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const [userLogin, setUserLogin] = useState(false);
    if (localStorage.getItem('UserLoged') && !userLogin) {
      const user = JSON.parse(localStorage.getItem('UserLoged'));
      const decoded = jwtDecode(user.data.token);
      if(decoded.exp - Math.floor(Date.now()/1000) <= 0){
        console.log("Cerrando secion (Tiempo expirado).");
        localStorage.removeItem('UserLoged');
      }
      else{
        setUserLogin(true);
      }
    } 
    const handleLogin = async() => {
        try{
          const user =  await login(username, password);
          if(user != null){
            window.localStorage.setItem('UserLoged', JSON.stringify(user));
            setUserLogin(true);
            setUsername("");
            setPassword("");
            const decoded = jwtDecode(user.data.token);
            console.log(decoded); // { sub: 'admin', roles: [...], iat: ..., exp: ... }
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
    

    return(
        <>
        <div className="fondo_login" style={{backgroundImage: `url(${fondo})`}}>
            <div className="cuadrado_login">
              <div className='titulo'>Bienvenido</div>
                <div className='icono_login'><FontAwesomeIcon icon={faCircleUser} color= "#1567b5" size="5x" /></div>

                <div className="texto">
                    {!userLogin ?(<>
                    <div className={"input_posicion"}>
                    <span>{"Usuario:"}</span>
                    <input
                        value={username}
                        onChange={(e) =>setUsername(e.target.value)}
                        style={{marginLeft: '48px',
                                backgroundColor:'#C4C0C0',
                                border: '1px solid #C4C0C0',
                                borderRadius: '10px' }}
                    />
                    
                    <br></br>
                    <span>{"Contraseña: "}</span>
                    <span className='p-2' onClick={() => setVisible(!visible)}>{visible?'◡':'👁'}</span>
                    <span>{"  "}</span>
                    <input
                      type={visible ? "text" : "password"}
                      value={password}
                      onChange={(c) =>setPassword(c.target.value)}
                      style={{marginLeft: '1px',
                        backgroundColor:'#C4C0C0',
                        border: '1px solid #C4C0C0',
                        borderRadius: '10px' }}
                    />
                    
                   
                    </div>
                    <button className="button" onClick={handleLogin}>Log In</button></>):
                    (<button className="button" onClick={logOut}>Log Out</button>)
                    }
                  </div>
                  <div>
                  <div className="texto" style={{ top: "14vh", position: "relative" }}>¿Aún no tienes una cuenta?</div>

                  <button className="button" onClick={handleLogin}>Registrarse</button>
                </div>
            </div>
        </div>
        </>
    )
}
export default Login;
