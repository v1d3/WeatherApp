import api from "../api/api";
import login from "./login";

const getAuthTokenWeather = () => {
  const token = localStorage.getItem("weatherToken");
  if (!token) throw new Error("No hay token de autenticación");
  console.log("Token de autenticación (weather):", token);
  return token;
};

const getAuthTokenActivity = () => {
  const token = localStorage.getItem("activityToken");
  if (!token) throw new Error("No hay token de autenticación");
  console.log("Token de autenticación (activity):", token);
  return token;
};

export const getAuthTokenCalendar = () => {
  const token = localStorage.getItem("calendarToken");
  if (!token) throw new Error("No hay token de autenticación");
  console.log("Token de autenticación (calendar):", token);
  return token;
};

export const calendarService = {
  getAllCalendars: async () => {
    const token = getAuthTokenCalendar();
    const response = await api.get('/calendar', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getCalendarById: async (id) => {
    const token = getAuthTokenCalendar();
    const response = await api.get(`/calendar/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createCalendar: async (calendarData) => {
    const token = getAuthTokenCalendar();
    const response = await api.post('/calendar', calendarData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  updateCalendar: async (id, calendarData) => {
    const token = getAuthTokenCalendar();
    const response = await api.put(`/calendar/${id}`, calendarData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteCalendar: async (calendarId) => {
    try {
      const token = localStorage.getItem('calendarToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.delete(`/calendar/${calendarId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error eliminando calendario:', error);
      throw new Error('Error al eliminar la actividad del calendario: ' + error.message);
    }
  },

  getUserCalendars: async (username) => {
    const token = getAuthTokenCalendar();
    const response = await api.get(`/calendar?username=${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export const weatherService = {
  saveWeather: async (weatherData) => {
    console.log("Datos del clima a guardar:", weatherData);
    try {
      const token = getAuthTokenWeather();

      if (!weatherData.weatherId && weatherData.weatherId !== 0) {
        throw new Error("El ID del clima es requerido");
      }
      const weatherId = parseInt(weatherData.weatherId);
      if (isNaN(weatherId)) {
        throw new Error("El ID del clima debe ser un número");
      }
      const dateObj = new Date(weatherData.dateTime);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Fecha no válida");
      }
      const formattedDate = dateObj.toISOString();

      if (!weatherData.location || weatherData.location.trim() === "") {
        throw new Error("La ubicación no puede estar vacía");
      }

      const payload = {
        weatherId,
        dateTime: formattedDate,
        location: weatherData.location,
        temperature: parseFloat(weatherData.temperature),
        humidity: parseInt(weatherData.humidity),
        windSpeed: parseFloat(weatherData.windSpeed),
      };

      console.log("Payload para backend:", payload);

      const response = await api.post(`/weather-data`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al guardar el clima:", error);
      throw new Error("Error al guardar el clima: " + error.message);
    }
  },

  getWeatherNames: async () => {
    try {
      const token = getAuthTokenWeather();
      const response = await api.get(`/weather`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.map((weather) => weather.name);
    } catch (error) {
      console.error("Error al obtener nombres del clima:", error);
      throw new Error("Error al obtener nombres del clima: " + error.message);
    }
  },
};

// Default activities
const getDefaultActivities = async () => {
  try{
    const response = await api.get('/default-activity')
    return response.data
  } catch(error){
    console.log(error);
  }
}

const createDefaultActivity = async (activity) => {
  console.log(activity);
  try{
    const response = await api.post('/default-activity', activity);
    return response.data;
  } catch(error){
    console.log(error);
  }
}

const deleteDefaultActivity = async (id) => {
  try{
    const response = await api.delete(`/default-activity/${id}`);
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

const updateDefaultActivity = async (id, activity) => {
  try{
    const response = await api.put(`/default-activity/${id}`, activity);
    return response.data
  } catch(error){
    console.log(error);
  }
  
}

// Tags
const getTags = async () => {
  try{
    const response = await api.get('/tag');
    return response.data;
  } catch(error) {
    console.log(error);
  }
}

const createTag = async (tag) => {
  try {
    const response = await api.post('/tag', tag);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

const deleteTag = async (id) => {
  try{
    const response = await api.delete(`/tag/${id}`);
    return true;
  } catch(error){
    console.log(error);
    return false;
  }
}

const getWeathers = async (id) => {
  try {
    const response = await api.get('/weather')
    return response.data;
  } catch (error) {
    console.log(error)
  }
}

export default {getDefaultActivities, deleteDefaultActivity, createDefaultActivity, getTags, createTag, deleteTag, getWeathers, updateDefaultActivity}