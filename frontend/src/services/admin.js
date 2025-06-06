import api from "../api/api";

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

  deleteCalendar: async (id) => {
    const token = getAuthTokenCalendar();
    await api.delete(`/calendar/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getUserCalendars: async (username) => {
    const token = getAuthTokenCalendar();
    const response = await api.get(`/calendar?username=${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export const activityService = {
  saveActivity: async (activityData) => {
    console.log("Datos de la actividad a guardar:", activityData);
    try {
      const token = getAuthTokenActivity();

      if (!activityData.name || activityData.name.trim() === "") {
        throw new Error("El nombre de la actividad es requerido");
      }

      const payload = {
        name: String(activityData.name),
        minTemperature: parseFloat(activityData.minTemperature),
        maxTemperature: parseFloat(activityData.maxTemperature),
        minHumidity: parseInt(activityData.minHumidity),
        maxHumidity: parseInt(activityData.maxHumidity),
        minWindSpeed: parseFloat(activityData.minWindSpeed),
        maxWindSpeed: parseFloat(activityData.maxWindSpeed),
        weatherIds: activityData.weatherIds,
      };

      console.log("Payload para backend:", payload);

      const response = await api.post(`/activity`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al guardar la actividad:", error);
      throw new Error("Error al guardar la actividad: " + error.message);
    }
  },

  getAllActivities: async () => {
    try {
      const token = getAuthTokenActivity();
      const response = await api.get(`/activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; 
    } catch (error) {
      console.error("Error al obtener todas las actividades:", error);
      throw new Error("Error al obtener todas las actividades: " + error.message);
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
