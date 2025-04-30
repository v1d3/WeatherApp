import React, { useState } from 'react';
import './App.css';
import User from './views/User'; 
import login from './services/login.js';
import Login from './pages/Login'; 

function App() {
  
import {jwtDecode} from 'jwt-decode';

function App() {


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

  return (
    <>
    <Login />

    </>
  );
}


export default App;

