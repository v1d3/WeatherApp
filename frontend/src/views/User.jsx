import solGIF from '../assets/sol.gif';
import '../App.css';

function User(){
    return(
        <div >
            <h1>El clima está </h1>   
            <a>
            <img src={solGIF} className="weather" alt="solGIF" />
            </a>        
        </div>
    )
}
export default User