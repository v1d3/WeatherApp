import fondo from "../assets/fondo_login.png";
import React, { useState, useEffect } from 'react';
import '../App.css';
import User from '../views/User';
import login from '../services/login.js';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import Admin from '../views/Admin';
import { useNavigate } from 'react-router-dom';

function Login() {

  const navigate = useNavigate();
  const [mostrarUser, actualizar_mU] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [userLogin, setUserLogin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");
  const [showLoginPage, setShowLoginPage] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('UserLoged')) {
      const user = JSON.parse(localStorage.getItem('UserLoged'));
      const decoded = jwtDecode(user.data.token);

      if (decoded.exp - Math.floor(Date.now() / 1000) <= 0) {
        console.log("Cerrando sesion (Tiempo expirado).");
        localStorage.removeItem('UserLoged');
      } else {
        setUserLogin(true);
        setUserRole(decoded.roles[0]);

        if (decoded.roles[0] === "ROLE_ADMIN") {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      }
    }
  }, []);

  const handleLogin = async () => {
    try {
      const user = await login(username, password);
      if (user != null) {
        window.localStorage.setItem('UserLoged', JSON.stringify(user));
        const decoded = jwtDecode(user.data.token);

        if (decoded.roles[0] === "ROLE_ADMIN") {
          navigate('/admin');
        } else {
          navigate('/user');
        }

        setUsername("");
        setPassword("");
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } catch (e) {
      console.log("ERROR: ", e);
      setError("Error al iniciar sesión");
    }
  };

  const logOut = async () => {
    if (localStorage.getItem('UserLoged')) {
      console.log("Borrando usuario logeado:", JSON.parse(localStorage.getItem('UserLoged')));
      localStorage.removeItem('UserLoged');
      setUserLogin(false);
      actualizar_mU(false);
      setUserRole(null);
      setShowLoginPage(true);
    } else {
      console.log("No hay usuario logeado.");
    }
  }

  const renderContent = () => {
    if (mostrarUser) {
      console.log("Current role:", userRole);
      if (userRole === "ROLE_ADMIN") {
        return <Admin logoutFunction={logOut} />;
      } else if (userRole === "ROLE_USER") {
        return <User logoutFunction={logOut} />;
      }
    }
    return null;
  }

  if (!showLoginPage) {
    return renderContent();
  }

  return (
    <div className="fondo_login" style={{ backgroundImage: `url(${fondo})` }}>
      <div className="cuadrado_login">
        <div className='titulo'>Bienvenido</div>
        <div className='icono_login'><FontAwesomeIcon icon={faCircleUser} color="#1567b5" size="5x" /></div>

        <div className="texto">
          {!userLogin ? (<>
            <div className={"input_posicion"}>
              <span>{"Usuario:"}</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  marginLeft: '48px',
                  backgroundColor: '#C4C0C0',
                  border: '1px solid #C4C0C0',
                  borderRadius: '10px'
                }}
              />

              <br></br>
              <span>{"Contraseña: "}</span>
              <span className='p-2' onClick={() => setVisible(!visible)}>{visible ? '◡' : '👁'}</span>
              <span>{"  "}</span>
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(c) => setPassword(c.target.value)}
                style={{
                  marginLeft: '1px',
                  backgroundColor: '#C4C0C0',
                  border: '1px solid #C4C0C0',
                  borderRadius: '10px'
                }}
              />

              {error && <div style={{ color: 'red' }}>{error}</div>}
            </div>
            <button className="button" onClick={handleLogin}>Log In</button></>) :
            (<button className="button" onClick={logOut}>Log Out</button>)
          }
        </div>
        {!userLogin && (
          <div>
            <div className="texto" style={{ top: "14vh", position: "relative" }}>¿Aún no tienes una cuenta?</div>
            <button className="button" onClick={handleLogin}>Registrarse</button>
          </div>
        )}
      </div>
    </div>
  )
}
export default Login;
