import api from "../api/api";

const saveActivity = async (activityData) => {
  console.log("Datos de la actividad a guardar:", activityData);
  try {
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

    const response = await api.post(`/activity`, payload);
    return response.data;
  } catch (error) {
    console.error("Error al guardar la actividad:", error);
    throw new Error("Error al guardar la actividad: " + error.message);
  }
}

const getAllActivities = async () => {
  try {
    return response.data;
  } catch (error) {
    console.error("Error al obtener todas las actividades:", error);
    throw new Error("Error al obtener todas las actividades: " + error.message);
  }
}

const getActivityNames = () => {
  try {
    return response.data.map((activity) => activity.name);
  } catch (error) {
    console.error("Error al obtener nombres de la actividad:", error);
    throw new Error(
      "Error al obtener nombres de la actividad: " + error.message
    );
  }
}

const createActivity = async(newActivity) => {
  try{
    const response = await api.post('/activity', newActivity);
    return response.data;
  } catch (error) {
    throw error;
  }
}

const deleteActivity = async(activityId) => {
  console.log("borrando la volaita");
  try{
    const response = await api.delete(`/activity/${activityId}`);
    if (response.status === 204) {
      return { success: true };
    } else if (response.status === 404) {
      throw new Error("Actividad no encontrada");
    } else if (response.status === 403) {
      throw new Error("No tienes permiso para eliminar esta actividad");
    } else if (response.status === 400) {
      throw new Error("Solicitud incorrecta al eliminar la actividad");
    } else {
      throw new Error("Error desconocido al eliminar la actividad");
    }
  } catch (error) {
    throw error;
  }
}


export default {saveActivity, getAllActivities, getActivityNames, deleteActivity, createActivity}