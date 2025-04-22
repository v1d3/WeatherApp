import axios from 'axios';

const login = async(username, password) => {
    console.log("Iniciando axios...")
    const respuesta = await axios.post('http://localhost:8080/api/v1/auth/login',{username: username, password: password})
    console.log("Respuesta: ",respuesta)
    console.log("Token: ",respuesta.data.token)
    return respuesta
};

export default login;