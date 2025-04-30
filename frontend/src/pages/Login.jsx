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
