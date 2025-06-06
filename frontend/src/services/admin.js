import api from "../api/api";
import login from "./login";

const getAuthTokenWeather = () => {
  const token = localStorage.getItem("weatherToken");
  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  console.log("Token de autenticación:", token);
  return token;
};

const getAuthTokenActivity = () => {
  const token = localStorage.getItem("activityToken");
  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  console.log("Token de autenticación:", token);
  return token;
};

export const weatherService = {
  saveWeather: async (weatherData) => {
    console.log("Datos del clima a guardar:", weatherData);
    try {
      const token = getAuthTokenWeather();

      let weatherId;
      try {
        if (!weatherData.weatherId && weatherData.weatherId !== 0) {
          throw new Error("El ID del clima es requerido");
        }

        weatherId = parseInt(weatherData.weatherId);
        if (isNaN(weatherId)) {
          throw new Error("El ID del clima debe ser un número");
        }
        console.log("ID del clima:", weatherId);
      } catch (e) {
        throw new Error("ID del clima no válido: " + e.message);
      }

      let formattedDate;
      try {
        const dateObj = new Date(weatherData.dateTime);
        if (isNaN(dateObj.getTime())) {
          throw new Error("Fecha no válida");
        }
        formattedDate = dateObj.toISOString();
      } catch (e) {
        throw new Error("Error en formato de fecha: " + e.message);
      }

      if (!weatherData.location.trim()) {
        throw new Error("La ubicación no puede estar vacía");
      }

      const payload = {
        weatherId: weatherId,
        dateTime: formattedDate,
        location: weatherData.location,
        temperature: parseFloat(weatherData.temperature),
        humidity: parseInt(weatherData.humidity),
        windSpeed: parseFloat(weatherData.windSpeed),
      };

      console.log("Sending payload to backend:", payload);

      try {
        const response = await api.post(`/weather-data`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error("Error al guardar el clima:", error);

        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          console.error("Código de estado:", error.response.status);
          console.error("Cabeceras:", error.response.headers);
        } else if (error.request) {
          console.error("Sin respuesta del servidor:", error.request);
        }

        throw new Error(`Error al guardar el clima: ${error.message}`);
      }
    } catch (error) {
      console.error("Error al guardar el clima:", error);
      throw new Error(`Error al guardar el clima: ${error.message}`);
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

export const activityService = {
  saveActivity: async (activityData) => {
    console.log("Datos del clima a guardar:", activityData);
    try {
      const token = getAuthTokenActivity();

      let activityId;
      try {
        if (!activityData.name && activityData.name !== "") {
          throw new Error("El nombre de la actividad es requerido");
        }

        activityId = String(activityData.name);
        if (!isNaN(activityId)) {
          throw new Error("El nombre de la actividad debe ser un texto");
        }
        console.log("Nombre de la actividad:", activityId);
      } catch (e) {
        throw new Error("Nombre de la actividad no válido: " + e.message);
      }

      console.log("ID de la actividad:", activityId);
      console.log("Temperatura mínima:", activityData.minTemperature);
      console.log("Temperatura máxima:", activityData.maxTemperature);
      console.log("Humedad mínima:", activityData.minHumidity);
      console.log("Humedad máxima:", activityData.maxHumidity);
      console.log("Velocidad del viento mínima:", activityData.minWindSpeed);
      console.log("Velocidad del viento máxima:", activityData.maxWindSpeed);
      console.log("IDs de clima:", activityData.weatherIds);

      const payload = {
        name: activityId,
        minTemperature: parseFloat(activityData.minTemperature),
        maxTemperature: parseFloat(activityData.maxTemperature),
        minHumidity: parseInt(activityData.minHumidity),
        maxHumidity: parseInt(activityData.maxHumidity),
        minWindSpeed: parseFloat(activityData.minWindSpeed),
        maxWindSpeed: parseFloat(activityData.maxWindSpeed),
        weatherIds: activityData.weatherIds,
      };

      console.log("Sending payload to backend:", payload);
      console.log("API URL:", `/activity`);
      try {
        const response = await api.post(`/activity`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error("Error al guardar la actividad:", error);

        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          console.error("Código de estado:", error.response.status);
          console.error("Cabeceras:", error.response.headers);
        } else if (error.request) {
          console.error("Sin respuesta del servidor:", error.request);
        }

        throw new Error(`Error al guardar la actividad: ${error.message}`);
      }
    } catch (error) {
      console.error("Error al guardar la actividad:", error);
      throw new Error(`Error al guardar la actividad: ${error.message}`);
    }
  },

  getActivityNames: async () => {
    try {
      const token = getAuthTokenActivity();
      const response = await api.get(`/activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.map((activity) => activity.name);
    } catch (error) {
      console.error("Error al obtener nombres de la actividad:", error);
      throw new Error(
        "Error al obtener nombres de la actividad: " + error.message
      );
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