import axios from 'axios';

const login = async(username, password) => {
    console.log("Iniciando axios...");
    try{
        const respuesta = await axios.post('http://localhost:8080/api/v1/auth/login',{username: username, password: password});
        console.log("Respuesta: ",respuesta);
        console.log("Token: ",respuesta.data.token);
        return respuesta;
    }catch(e){
        console.log("Error ingresando usuario: ", e);
        return null;
    }
};

export default login;