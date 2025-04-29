import solGIF from '../assets/sol.gif';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock,faTemperatureThreeQuarters,faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import {Navbar,Nav} from 'react-bootstrap';
import { useState } from 'react'; 
import '../styles/user.css';

function User() {
    const [sobreponer, setsobreponer] = useState(false);
    
    return (
    <main>
    <Navbar>
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
        <div className="middle">
            <img src={solGIF} className="weather" alt="solGIF" />

            <div className='recomendacion'></div>
        </div>
        <div className='linea_inferior'>
            <div className='datos'>
                <div>
                    <FontAwesomeIcon icon={faTemperatureThreeQuarters} color= "#5dade2" size="2x" />
                </div>
                <div>
                    <FontAwesomeIcon icon={faClock} color="#5dade2" size="2x" /> 
                </div>
                <div>
                    <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" size="2x" />
                </div>
            </div>
        </div>
    </main>
  );
}

export default User;