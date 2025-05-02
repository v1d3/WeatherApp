import api from '../api/api';

const login = async (username, password) => {
    console.log(api.defaults.baseURL);
    try {
        const respuesta = await api.post('/auth/login', { username: username, password: password });
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