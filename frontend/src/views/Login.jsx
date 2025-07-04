import fondo from "../assets/fondo_login.png";
import React, { useState, useEffect } from 'react';
import User from '../views/User';
import login from '../services/login.js';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faUser } from '@fortawesome/free-solid-svg-icons';
import Admin from './AdminForecast.jsx';
import { Navigate, useNavigate } from 'react-router-dom';

import styles from '../styles/login.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('UserLoged')) {
            const user = JSON.parse(localStorage.getItem('UserLoged'));
            console.log("USUARIO: ", user)
            const decoded = jwtDecode(user.data.token);

            if (decoded.exp - Math.floor(Date.now() / 1000) <= 0) {
                console.log("Cerrando sesion (Tiempo expirado).");
                localStorage.removeItem('UserLoged');
            } else {
                setUserLogin(true);
                setUserRole(decoded.roles[0]);

                if (decoded.roles[0] === "ROLE_ADMIN") {
                    navigate('/admin/activities');
                } else {
                    navigate('/user');
                }
            }
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const user = await login(username, password);
            if (user != null) {
                window.localStorage.setItem('UserLoged', JSON.stringify(user));
                
                const decoded = jwtDecode(user.data.token);

                if (decoded.roles[0] === "ROLE_ADMIN") {
                    navigate('/admin/activities');
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
        } finally {
            setIsSubmitting(false);
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
        <main className={styles.login_bg}>
            <form className="rounded-4 bg-white m-auto py-5 px-5 d-flex d-flex flex-column
            col-12 col-sm-8 col-md-6 col-xl-4 col-xxl-3 shadow-lg" onSubmit={(e) => { handleLogin(e) }}>
                
                <h1 className="h3 mb-3 fw-normal">Bienvenido</h1>

                <div className="my-2 mb-4">
                    <FontAwesomeIcon icon={faCircleUser} color="#1567b5" size="4x" />
                </div>

                <div className={`form-floating ${styles.form_floating}`}>
                    <input type="text" className={`form-control ${styles.floatingName}`} id="floatingName" placeholder="username"
                    value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    <label htmlFor="floatingName">Usuario</label>
                </div>

                <div className="input-group mb-2">
                    <div className={`form-floating ${styles.form_floating} flex-grow-1`}>
                        <input
                            type={visible ? "text" : "password"}
                            className={`form-control ${styles.floatingPassword}`}
                            id="floatingPassword"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            // style={{borderWidth: '2px'}}
                        />
                        <label htmlFor="floatingPassword">Contraseña</label>
                    </div>
                    <span className={`input-group-text ${styles.eye}`} onClick={() => setVisible(!visible)}>
                        {visible ? '◡' : '👁'}
                    </span>
                </div>
        
                {error && <span className=" text-danger">{error}</span>}
                
                <button
                    className="mt-2 btn btn-primary btn-md col-12 mx-auto mb-2"
                    type="submit"
                    disabled={isSubmitting} // Deshabilita el botón mientras se envía
                >
                    {isSubmitting ? (
                        <span>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        </span>
                    ) : (
                        "Login"
                    )}
                </button>

                <p className="text-secondary mb-2">¿Aún no tienes una cuenta?</p>
                <button 
                    className="btn btn-outline-primary btn-md col-12 mx-auto" 
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/register');
                    }}
                >
                    Registrarse
                </button>
            </form>
        </main>
    )
}
export default Login;
