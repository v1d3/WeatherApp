import axios from 'axios';

const login = async (username, password) => {
    try {
        const respuesta = await axios.post('http://localhost:8080/api/v1/auth/login', { username: username, password: password });
        console.log("Respuesta: ", respuesta);

        if (respuesta.data && respuesta.data.token) {
            localStorage.removeItem('weatherToken');
            localStorage.setItem('weatherToken', respuesta.data.token.trim());
            localStorage.setItem('activityToken', respuesta.data.token.trim());
            console.log("Token almacenado:", respuesta.data.token.trim());
        }

        return respuesta;
    } catch (e) {
        console.log("Error ingresando usuario: ", e);
        return null;
    }
};

export default login;