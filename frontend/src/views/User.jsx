import solGIF from '../assets/sol.gif';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock,faTemperatureThreeQuarters,faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import {Navbar,Nav} from 'react-bootstrap';
import { useState } from 'react'; 

function User() {
    const [sobreponer, setsobreponer] = useState(false);
    const linea_inferior = {
        width: '100vw',
        height: '38vh',
        backgroundColor: 'skyblue',
        position: 'fixed',
        bottom: 0,
    };
    const barra = {
        width: '100vw',
        height: '8vh',
        backgroundColor: '#156DB5',
        position: 'fixed',
        top: 0,
    };
    const datos = {
        width: '40vw',
        height: '30vh',
        backgroundColor: 'white',
        top: '66vh',
        left: '2vw', 
        position: 'fixed',
        borderRadius: '10px', 
    };
    const recomendacion = {
        width: '40vw',
        height: '45vh',
        backgroundColor: "#5dade2",
        top: '12vh',
        right: '4vw', 
        position: 'fixed',
        borderRadius: '15px', 
    };
    return (
    <>
    <Navbar style={barra}>
        <Nav className="me-auto">
            <Nav.Link
                href="#cuenta"
                style={{ color: sobreponer ? '#FFD700' : 'white', position: 'fixed',top: '2vh',right: '3vw'}} 
                onMouseEnter={() => setsobreponer(true)} 
                onMouseLeave={() => setsobreponer(false)}
                >Mi cuenta
            </Nav.Link>
        </Nav>
    </Navbar>
    <div>
        <div style={linea_inferior}></div>
        <div style={recomendacion}></div>
        <div style={datos}></div>
        <div>
            <div>
                <img src={solGIF} className="weather" alt="solGIF" style={{position: 'absolute',top: '15vh',left: '2vw'}}/>
            </div>
        </div>
        
        <div>
            <FontAwesomeIcon icon={faTemperatureThreeQuarters} color= "#5dade2"  size="2x" style={{position: 'fixed',top: '69vh',left: '4.5vw'}} />
            <FontAwesomeIcon icon={faClock} color="#5dade2" size="2x"style={{position: 'fixed',top: '77vh',left: '4vw'}} /> 
            <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" size="2x" style={{position: 'fixed',top: '85vh',left: '4vw'}} />
        </div>
    </div>
    </>
  );
}

export default User;

