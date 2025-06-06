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
            localStorage.setItem('calendarToken', respuesta.data.token.trim());
            console.log("Token almacenado:", respuesta.data.token.trim());
        }

        if (respuesta.data && respuesta.data.user && respuesta.data.user.id) {
          localStorage.setItem('userId', String(respuesta.data.user.id));
          console.log("User ID almacenado:", respuesta.data.user.id);
        }
        if (respuesta.data && respuesta.data.user && respuesta.data.user.name) {
            localStorage.setItem('userName', respuesta.data.user.name.trim());
            console.log("Nombre del usuario almacenado:", respuesta.data.user.name.trim());
        }


        return respuesta;
    } catch (e) {
        console.log("Error ingresando usuario: ", e);
        return null;
    }
};

export default login;