import React, { useState, useEffect } from "react";
import { activityService, weatherService } from "../services/admin";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function Admin() {
  const [weatherNames, setWeatherNames] = useState([]);
  const [formDataWeather, setFormDataWeather] = useState({
    weatherId: "", // Inicialmente vacío pero será seleccionado por el usuario
    dateTime: "",
    location: "",
    temperature: "",
    humidity: "",
    windSpeed: "",
  });

  const [formDataActivity, setFormDataActivity] = useState({
    name: "",
    minTemperature: "",
    maxTemperature: "",
    minHumidity: "",
    maxHumidity: "",
    minWindSpeed: "",
    maxWindSpeed: "",
    weatherIds: [],
  });

  useEffect(() => {
    const fetchWeatherNames = async () => {
      try {
        const names = await weatherService.getWeatherNames();
        setWeatherNames(names);
      } catch (error) {
        console.error("Error al cargar nombres del clima:", error);
        alert(error.message);
      }
    };
    fetchWeatherNames();
  }, []);

  const handleWeatherChange = (e) => {
    const selectedWeatherId = Number(e.target.value); // Convertir explícitamente a número

    setFormDataWeather({
      ...formDataWeather,
      weatherId: selectedWeatherId,
    });

    console.log(
      "Weather ID seleccionado:",
      selectedWeatherId,
      typeof selectedWeatherId
    );
  };

  const handleActivityChange = (e) => {
    const selectedActivityId = Number(e.target.value); // Convertir explícitamente a número

    setFormDataActivity({
      ...formDataActivity,
      name: selectedActivityId,
    });

    console.log(
      "Actividad seleccionada:",
      selectedActivityId,
      typeof selectedActivityId
    );
  };

  const handleSubmitWeather = async (e) => {
    e.preventDefault();

    try {
      const {
        weatherId,
        dateTime,
        location,
        temperature,
        humidity,
        windSpeed,
      } = formDataWeather;

      if (
        !weatherId ||
        !dateTime ||
        !location ||
        !humidity ||
        !windSpeed ||
        !temperature
      ) {
        var text = "";
        if (!weatherId) {
          text = text + " Clima";
        }
        if (!dateTime) {
          if (text != "") {
            text = text + ";";
          }
          text = text + " Hora";
        }
        if (!location) {
          if (text != "") {
            text = text + ";";
          }
          text = text + " Lugar";
        }
        if (!humidity) {
          if (text != "") {
            text = text + ";";
          }
          text = text + " Humedad";
        }
        if (!windSpeed) {
          if (text != "") {
            text = text + ";";
          }
          text = text + " Velocidad del viento";
        }
        if (!temperature) {
          if (text != "") {
            text = text + ";";
          }
          text = text + " Temperatura";
        }
        throw new Error(
          "Por favor complete todos los campos, falta:" + String(text)
        );
      }

      const humValue = parseInt(humidity);
      if (humValue < 0 || humValue > 100) {
        throw new Error("La humedad debe estar entre 0 y 100%");
      }

      const tempValue = parseFloat(temperature);
      if (tempValue < -50 || tempValue > 50) {
        throw new Error("La temperatura debe estar entre -50°C y 50°C");
      }

      const windValue = parseFloat(windSpeed);
      if (windValue < 0 || windValue > 200) {
        throw new Error(
          "La velocidad del viento debe estar entre 0 y 200 km/h"
        );
      }

      await weatherService.saveWeather({
        weatherId,
        dateTime,
        location,
        temperature: tempValue,
        humidity: humValue,
        windSpeed: windValue,
      });

      alert("Datos guardados exitosamente");

      // Clear form
      setFormDataWeather({
        weatherId: "",
        dateTime: "",
        location: "",
        temperature: "",
        humidity: "",
        windSpeed: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  const handleSubmitActivity = async (e) => {
    e.preventDefault();

    try {
      const {
        name,
        minTemperature,
        maxTemperature,
        minHumidity,
        maxHumidity,
        minWindSpeed,
        maxWindSpeed,
        weatherIds,
      } = formDataActivity;

      if (
        !name ||
        !minTemperature ||
        !maxTemperature ||
        !minHumidity ||
        !maxHumidity ||
        !minWindSpeed ||
        !maxWindSpeed ||
        !weatherIds
      ) {
        throw new Error("Por favor complete todos los campos");
      }

      const minHumValue = parseInt(minHumidity);
      if (minHumValue < 0 || minHumValue > 100) {
        throw new Error("La humedad mínima debe estar entre 0 y 100%");
      }

      const maxHumValue = parseInt(maxHumidity);
      if (maxHumValue < 0 || maxHumValue > 100) {
        throw new Error("La humedad máxima debe estar entre 0 y 100%");
      }
      if (maxHumValue < minHumValue) {
        throw new Error("La humedad máxima debe ser mayor a la humedad mínima");
      }

      const maxTempValue = parseInt(maxTemperature);
      if (maxTempValue < -50 || maxTempValue > 50) {
        throw new Error("La temperatura mínima debe estar entre -50°C y 50°C");
      }

      const minTempValue = parseInt(minTemperature);
      if (minTempValue < -50 || minTempValue > 50) {
        throw new Error("La temperatura máxima debe estar entre -50°C y 50°C");
      }
      if (maxTempValue < minTempValue) {
        throw new Error(
          "La temperatura máxima debe ser mayor a la temperatura mínima"
        );
      }

      const minWindValue = parseFloat(minWindSpeed);
      if (minWindValue < 0 || minWindValue > 200) {
        throw new Error(
          "La velocidad mínima del viento debe estar entre 0 y 200 km/h"
        );
      }
      const maxWindValue = parseFloat(maxWindSpeed);
      if (maxWindValue < 0 || maxWindValue > 200) {
        throw new Error(
          "La velocidad mínima del viento debe estar entre 0 y 200 km/h"
        );
      }
      if (maxWindValue < minWindValue) {
        throw new Error(
          "La velocidad máxima del viento debe ser mayor a la velocidad mínima"
        );
      }

      await activityService.saveActivity({
        name,
        minTemperature: minTempValue,
        maxTemperature: maxTempValue,
        minHumidity: minHumValue,
        maxHumidity: maxHumValue,
        minWindSpeed: minWindValue,
        maxWindSpeed: maxWindValue,
        weatherIds,
      });

      alert("Datos guardados exitosamente");

      // Clear form
      setFormDataActivity({
        name: "",
        minTemperature: "",
        maxTemperature: "",
        minHumidity: "",
        maxHumidity: "",
        minWindSpeed: "",
        maxWindSpeed: "",
        weatherIds: [],
      });
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  const handleInputChangeWeather = (e) => {
    const { name, value } = e.target;
    setFormDataWeather({
      ...formDataWeather,
      [name]: value,
    });
  };

  const handleInputChangeActivity = (e) => {
    const { name, value } = e.target;
    setFormDataActivity({
      ...formDataActivity,
      [name]: value,
    });
  };

  const navigate = useNavigate();

  const logOut = () => {
    localStorage.removeItem("UserLoged");
    navigate("/login");
  };

  useEffect(() => {
    const fetchWeatherNames = async () => {
      try {
        const names = await weatherService.getWeatherNames();
        setWeatherNames(names);
      } catch (error) {
        console.error("Error al cargar nombres del clima:", error);
        alert(error.message);
      }
    };
    fetchWeatherNames();
  }, []);

  return (
    <div>
      <h1>Panel de Administración</h1>

      <form className="formulario" onSubmit={handleSubmitWeather}>
        <ul className="Lista_de_formulario">
          <li>
            <label htmlFor="weatherId" style={{ marginRight: "50px" }}>
              Clima:
            </label>
            <Select
              id="weatherId"
              name="weatherId"
              options={weatherNames.map((name, index) => ({
                value: index + 1,
                label: name,
              }))}
              value={
                formDataWeather.weatherId
                  ? {
                      value: formDataWeather.weatherId,
                      label:
                        weatherNames[formDataWeather.weatherId - 1] ||
                        `Weather ${formDataWeather.weatherId}`,
                    }
                  : null
              }
              onChange={(selected) => {
                setFormDataWeather({
                  ...formDataWeather,
                  weatherId: selected ? selected.value : "",
                });
              }}
              placeholder="Seleccione un clima"
              className="basic-select"
              classNamePrefix="select"
            />
          </li>
          <li>
            <label htmlFor="temperature" style={{ marginRight: "50px" }}>
              Temperatura (°C):
            </label>
            <input
              id="temperature"
              name="temperature"
              type="number"
              step="0.1"
              value={formDataWeather.temperature}
              onChange={handleInputChangeWeather}
              placeholder="Ej: 25.5"
            />
          </li>
          <li>
            <label htmlFor="humidity" style={{ marginRight: "50px" }}>
              Humedad (%):
            </label>
            <input
              id="humidity"
              name="humidity"
              type="number"
              min="0"
              max="100"
              value={formDataWeather.humidity}
              onChange={handleInputChangeWeather}
              placeholder="Ej: 75"
            />
          </li>
          <li>
            <label htmlFor="windSpeed" style={{ marginRight: "50px" }}>
              Velocidad del viento (km/h):
            </label>
            <input
              id="windSpeed"
              name="windSpeed"
              type="number"
              step="0.1"
              value={formDataWeather.windSpeed}
              onChange={handleInputChangeWeather}
              placeholder="Ej: 15.5"
            />
          </li>

          <li>
            <label htmlFor="dateTime" style={{ marginRight: "50px" }}>
              Fecha:
            </label>
            <input
              id="dateTime"
              name="dateTime"
              type="datetime-local"
              value={formDataWeather.dateTime}
              onChange={handleInputChangeWeather}
            />
          </li>
          <li>
            <label htmlFor="location" style={{ marginRight: "50px" }}>
              Ubicación:
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formDataWeather.location}
              onChange={handleInputChangeWeather}
              placeholder="Concepción, Chile"
            />
          </li>
        </ul>

        <button type="submit">Guardar clima</button>
      </form>

      <form className="formulario" onSubmit={handleSubmitActivity}>
        <ul className="Lista_de_formulario">
          <li>
            <label htmlFor="name" style={{ marginRight: "50px" }}>
              Nombre de la actividad:
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formDataActivity.name}
              onChange={handleInputChangeActivity}
              placeholder="Ej: Caminar, correr, leer..."
            />
          </li>
          <li>
            <label htmlFor="weatherIds" style={{ marginRight: "50px" }}>
              Climas compatibles:
            </label>
            <Select
              id="weatherIds"
              name="weatherIds"
              isMulti
              options={weatherNames.map((name, index) => ({
                value: index + 1,
                label: name,
              }))}
              value={formDataActivity.weatherIds.map((id) => {
                const index = id - 1;
                return {
                  value: id,
                  label: weatherNames[index] || `Weather ${id}`,
                };
              })}
              onChange={(selected) => {
                setFormDataActivity({
                  ...formDataActivity,
                  weatherIds: selected
                    ? selected.map((option) => option.value)
                    : [],
                });
              }}
              placeholder="Seleccione climas compatibles"
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </li>
          <li>
            <label htmlFor="minTemperature" style={{ marginRight: "50px" }}>
              Temperatura mínima (°C):
            </label>
            <input
              id="minTemperature"
              name="minTemperature"
              type="number"
              step="0.1"
              value={formDataActivity.minTemperature}
              onChange={handleInputChangeActivity}
              placeholder="Ej: 25.5"
            />
          </li>

          <li>
            <label htmlFor="maxTemperature" style={{ marginRight: "50px" }}>
              Temperatura máxima (°C):
            </label>
            <input
              id="maxTemperature"
              name="maxTemperature"
              type="number"
              step="0.1"
              value={formDataActivity.maxTemperature}
              onChange={handleInputChangeActivity}
              placeholder="Ej: 25.5"
            />
          </li>
          <li>
            <label htmlFor="minHumidity" style={{ marginRight: "50px" }}>
              Humedad mínima (%):
            </label>
            <input
              id="minHumidity"
              name="minHumidity"
              type="number"
              min="0"
              max="100"
              value={formDataActivity.minHumidity}
              onChange={handleInputChangeActivity}
              placeholder="Ej: 75"
            />
          </li>

          <li>
            <label htmlFor="maxHumidity" style={{ marginRight: "50px" }}>
              Humedad máxima (%):
            </label>
            <input
              id="maxHumidity"
              name="maxHumidity"
              type="number"
              min="0"
              max="100"
              value={formDataActivity.maxHumidity}
              onChange={handleInputChangeActivity}
              placeholder="Ej: 75"
            />
          </li>
          <li>
            <label htmlFor="minWindSpeed" style={{ marginRight: "50px" }}>
              Velocidad del viento min. (km/h):
            </label>
            <input
              id="minWindSpeed"
              name="minWindSpeed"
              type="number"
              step="0.1"
              value={formDataActivity.minWindSpeed}
              onChange={handleInputChangeActivity}
              placeholder="Ej: 15.5"
            />
          </li>
          <li>
            <label htmlFor="maxWindSpeed" style={{ marginRight: "50px" }}>
              Velocidad del viento max. (km/h):
            </label>
            <input
              id="maxWindSpeed"
              name="maxWindSpeed"
              type="number"
              step="0.1"
              value={formDataActivity.maxWindSpeed}
              onChange={handleInputChangeActivity}
              placeholder="Ej: 15.5"
            />
          </li>
        </ul>

        <button type="submit">Guardar actividad</button>
      </form>

      <button onClick={logOut}>Cerrar Sesión</button>
    </div>
  );
}

export default Admin;
