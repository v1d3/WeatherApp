import { useState } from 'react';
import './App.css';
import User from './views/User'; 

function App() {
  const [mostrarUser, actualizar_mU] = useState(false);

  return (
    <div >
      {mostrarUser ? (<User />):(
        <button className = "button" onClick={() => actualizar_mU(true)}>Clima</button>
      )}
    </div>
  );
}


export default App;
