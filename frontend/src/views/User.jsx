import solGIF from '../assets/sol.gif';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock,faTemperatureThreeQuarters,faCalendarDays } from '@fortawesome/free-solid-svg-icons';

function User() {
    const linea_inferior = {
        width: '100%',
        height: '230px',
        backgroundColor: 'skyblue',
        position: 'fixed',
        bottom: 0,
    };
    const datos = {
        width: '500px',
        height: '180px',
        backgroundColor: 'white',
        top: '380px',
        left: '20px', 
        position: 'fixed',
        borderRadius: '10px', 
    };
    const recomendacion = {
        width: '500px',
        height: '270px',
        backgroundColor: "#5dade2",
        top: '40px',
        right: '40px', 
        position: 'fixed',
        borderRadius: '15px', 
    };
      

  return (
    <div>
        <div style={linea_inferior}></div>
        <div style={recomendacion}></div>
        <div style={datos}></div>
        <div>
            <div>
                <img src={solGIF} className="weather" alt="solGIF" style={{position: 'absolute',top: '60px',left: '80px'}}/>
            </div>
        </div>
        
        <div>
            <FontAwesomeIcon icon={faTemperatureThreeQuarters} color= "#5dade2"  size="2x" style={{position: 'fixed',top: '400px',left: '55px'}} />
            <FontAwesomeIcon icon={faClock} color="#5dade2" size="2x"style={{position: 'fixed',top: '450px',left: '50px'}} /> 
            <FontAwesomeIcon icon={faCalendarDays} color="#5dade2" size="2x" style={{position: 'fixed',top: '500px',left: '50px'}} />
        </div>
    </div>
  );
}

export default User;

