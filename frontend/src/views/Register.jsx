import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightToBracket, faCircleUser, faUser } from '@fortawesome/free-solid-svg-icons';

import User from '../views/User';
import Admin from '../views/Admin';

import UserService from '../services/user';

import styles from '../styles/register.module.css';
import fondo from "../assets/fondo_login.png";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import user from '../services/user';


function Register() {

    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [visible, setVisible] = useState(false);
    const [visibleConfirm, setVisibleConfirm] = useState(false);

    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordConfirmError, setPasswordConfirmError] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showLoginPage, setShowLoginPage] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; 

        setIsSubmitting(true);
        setSuccess("");
        // Input validation
        let localUsernameError = false;
        let localPasswordError = false;
        let localPasswordConfirmError = false;

        if (password !== passwordConfirm) {
            localPasswordConfirmError = true;
            setError("Las contraseñas no coinciden");
        }

        if (password.length < 8) {
            localPasswordError = true;
            setError("La contraseña debe tener al menos 8 caracteres");
        }

        if(username.length < 4 || username.length > 12){
            localUsernameError = true;
            setError("El nombre de usuario debe tener entre 4 y 12 caracteres");
        }
        
        setUsernameError(localUsernameError);
        setPasswordError(localPasswordError);
        setPasswordConfirmError(localPasswordConfirmError);

        if (localPasswordError || localUsernameError || localPasswordConfirmError) {
            setIsSubmitting(false);
            return;
        }

        setError("");

        try {
            const user = await UserService.register(username, password);
            console.log(user);
            setSuccess("Usuario registrado exitosamente");
        } catch (e) {
            if(e.message){
                setError(e.message);
            }
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
        <main className={`${styles.register_bg}`}>
            <form className="rounded-4 bg-white m-auto py-5 px-5 d-flex d-flex flex-column
            col-12 col-sm-8 col-md-6 col-xl-4 col-xxl-3 shadow-lg" onSubmit={(e) => { handleSubmit(e) }}>
                
                <h1 className="h3 mb-3 fw-normal">Registro</h1>

                <div className="my-2 mb-4">
                    <FontAwesomeIcon icon={faArrowRightToBracket} color="#1567b5" size="4x" />
                </div>

                <div className={`form-floating ${styles.form_floating} ${usernameError ? styles.z_index : styles.z_index0}`}>
                    <input type="text" className={`form-control ${styles.floatingName} ${usernameError ? "is-invalid" : ""}`} id="floatingName" placeholder="username"
                    value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    <label htmlFor="floatingName">Usuario</label>
                </div>

                <div className="input-group">
                    <div className={`form-floating ${styles.form_floating} ${passwordError ? styles.z_index : styles.z_index0} flex-grow-1`}>
                        <input
                            type={visible ? "text" : "password"}
                            className={`form-control ${styles.floatingPassword} ${passwordError ? "is-invalid" : ""}`}
                            id="floatingPassword"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="floatingPassword">Contraseña</label>
                    </div>
                    <span className={`input-group-text rounded-0 ${styles.eye}`} onClick={() => setVisible(!visible)}>
                        {visible ? '◡' : '👁'}
                    </span>
                </div>

                <div className="mb-2 input-group">
                    <div className={`form-floating ${styles.form_floating} flex-grow-1`}>
                        <input
                            type={visibleConfirm ? "text" : "password"}
                            className={`form-control ${passwordConfirmError ? "is-invalid" : ""} ${styles.floatingPasswordConfirm}`}
                            id="floatingPasswordConfirm"
                            placeholder="Password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                        <label htmlFor="floatingPasswordConfirm">Confirmar Contraseña</label>
                    </div>
                    <span className={`input-group-text ${styles.eye}`} onClick={() => setVisibleConfirm(!visibleConfirm)}>
                        {visibleConfirm ? '◡' : '👁'}
                    </span>
                </div>
        
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>{success}</div>}
                
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
                        "Registrar"
                    )}
                </button>

                <p className="text-secondary mb-2">¿Ya tienes cuenta?</p>
                <button 
                    className="btn btn-outline-primary btn-md col-12 mx-auto" 
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                    }}
                >
                    Iniciar sesión
                </button>
            </form>
        </main>
    )
}
export default Register;
