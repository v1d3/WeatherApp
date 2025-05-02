import React, { useState, useEffect } from "react";
import { activityService, weatherService } from "../services/admin";
import "../App.css";
import Select from "react-select";
import Sidebar from "../components/Sidebar";

function Admin() {

    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmitActivity = async (e) => {
        e.preventDefault();
        if(isSubmitting) return;
        setIsSubmitting(true);

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
        } finally{
            setIsSubmitting(false);
        }
    };

    const handleInputChangeActivity = (e) => {
        const { name, value } = e.target;
        setFormDataActivity({
            ...formDataActivity,
            [name]: value,
        });
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
    <>
    <div className='vh-100 d-flex'>
    <Sidebar activeIndex={2}/>
    <main className='flex-grow-1 bg-body-tertiary'>
    <div className=" col-12 col-sm-11 col-md-9 col-xl-6 m-auto">

      <form onSubmit={handleSubmitActivity}>
        <h1 className="h3 mb-4 fw-normal">Añadir Actividad</h1>
        <div className="row mb-3">
            <label htmlFor="name" className="col-sm-4 col-form-label">Nombre</label>
            <div className="col-sm-8">
                <input className="form-control m-auto"
                id="name"
                name="name"
                type="text"
                value={formDataActivity.name}
                onChange={handleInputChangeActivity}
                placeholder="Ej: Caminar, correr, leer..."
                />
            </div>
        </div>

        <div className="row mb-3">
            <label htmlFor="weatherIds" className="col-sm-4 col-form-label">Climas</label>
            <div className="col-sm-8">
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
            </div>
        </div>

        <div className="row mb-3">
            <label htmlFor="minTemperature" className="col-sm-4 col-form-label">Temperatura mínima (°C)</label>
            <div className="col-sm-8">
                <input className="form-control m-auto"
                    id="minTemperature"
                    name="minTemperature"
                    type="number"
                    step="0.1"
                    value={formDataActivity.minTemperature}
                    onChange={handleInputChangeActivity}
                    placeholder="Ej: 25.5"
                />
            </div>
        </div>

        <div className="row mb-3">
            <label htmlFor="maxTemperature" className="col-sm-4 col-form-label">Temperatura máxima (°C)</label>
            <div className="col-sm-8">
                <input className="form-control m-auto"
                    id="maxTemperature"
                    name="maxTemperature"
                    type="number"
                    step="0.1"
                    value={formDataActivity.maxTemperature}
                    onChange={handleInputChangeActivity}
                    placeholder="Ej: 25.5"
                />
            </div>
        </div>

        <div className="row mb-3">
            <label htmlFor="minHumidity" className="col-sm-4 col-form-label">Humedad mínima %</label>
            <div className="col-sm-8">
                <input className="form-control m-auto"
                    id="minHumidity"
                    name="minHumidity"
                    type="number"
                    min="0"
                    max="100"
                    value={formDataActivity.minHumidity}
                    onChange={handleInputChangeActivity}
                    placeholder="Ej: 75"
                />
            </div>
        </div>

        <div className="row mb-3">
            <label htmlFor="maxHumidity" className="col-sm-4 col-form-label">Humedad máxima %</label>
            <div className="col-sm-8">
                <input className="form-control m-auto"
                    id="maxHumidity"
                    name="maxHumidity"
                    type="number"
                    min="0"
                    max="100"
                    value={formDataActivity.maxHumidity}
                    onChange={handleInputChangeActivity}
                    placeholder="Ej: 75"
                />
            </div>
        </div>

        <div className="row mb-3">
            <label htmlFor="minWindSpeed" className="col-sm-4 col-form-label">Viento mínimo Km/h</label>
            <div className="col-sm-8">
                <input className="form-control m-auto"
                    id="minWindSpeed"
                    name="minWindSpeed"
                    type="number"
                    step="0.1"
                    value={formDataActivity.minWindSpeed}
                    onChange={handleInputChangeActivity}
                    placeholder="Ej: 15.5"
                />
            </div>
        </div>

        <div className="row mb-3">
            <label htmlFor="maxWindSpeed" className="col-sm-4 col-form-label">Viento máximo Km/h</label>
            <div className="col-sm-8">
                <input className="form-control m-auto"
                    id="maxWindSpeed"
                    name="maxWindSpeed"
                    type="number"
                    step="0.1"
                    value={formDataActivity.maxWindSpeed}
                    onChange={handleInputChangeActivity}
                    placeholder="Ej: 15.5"
                />
            </div>
        </div>

        <button type="submit" className={`btn btn-primary col-12 col-md-6 ${isSubmitting ? "disabled" : ""}`}>
            {isSubmitting ? (
                <span>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </span>
            ) : (
                "Añadir"
            )}
        </button>
      </form>

    </div>
    </main>
    </div>
    </>
    );
}

export default Admin;
