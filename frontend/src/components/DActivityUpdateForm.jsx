import { forwardRef, useState, useEffect } from "react"
import Select from "react-select";

const DActivityUpdateForm = forwardRef(({ tags, weathers, handleSubmit, activity }, ref) => {
  const [error, setError] = useState({
    name: false,
    minTemperature: false,
    maxTemperature: false,
    temperatureRange: false,
    minHumidity: false,
    maxHumidity: false,
    humidityRange: false,
    minWindSpeed: false,
    maxWindSpeed: false,
    windSpeedRange: false,
    weatherIds: false,
    tagIds: false
  });

  const [formDataActivity, setFormDataActivity] = useState({
    name: activity.name,
    minTemperature: activity.minTemperature,
    maxTemperature: activity.maxTemperature,
    minHumidity: activity.minHumidity,
    maxHumidity: activity.maxHumidity,
    minWindSpeed: activity.minWindSpeed,
    maxWindSpeed: activity.maxWindSpeed,
    weatherIds: activity.weathers.map(weather => weather.id),
    tagIds: activity.tags.map(tag => tag.id)
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...error };

    // Validar nombre
    if (!formDataActivity.name.trim()) {
      newErrors.name = true;
      isValid = false;
    } else {
      newErrors.name = false;
    }

    // Validar temperatura
    if (formDataActivity.minTemperature === '' || isNaN(formDataActivity.minTemperature)) {
      newErrors.minTemperature = true;
      isValid = false;
    } else if (Number(formDataActivity.minTemperature) < -273 || Number(formDataActivity.minTemperature) > 100) {
      newErrors.minTemperature = true;
      isValid = false;
    } else {
      newErrors.minTemperature = false;
    }

    if (formDataActivity.maxTemperature === '' || isNaN(formDataActivity.maxTemperature)) {
      newErrors.maxTemperature = true;
      isValid = false;
    } else if (Number(formDataActivity.maxTemperature) < -273 || Number(formDataActivity.maxTemperature) > 100) {
      newErrors.maxTemperature = true;
      isValid = false;
    } else {
      newErrors.maxTemperature = false;
    }

    // Validar rango de temperatura
    if (!newErrors.minTemperature && !newErrors.maxTemperature &&
      Number(formDataActivity.minTemperature) > Number(formDataActivity.maxTemperature)) {
      newErrors.temperatureRange = true;
      isValid = false;
    } else {
      newErrors.temperatureRange = false;
    }

    // Validar humedad
    if (formDataActivity.minHumidity === '' || isNaN(formDataActivity.minHumidity)) {
      newErrors.minHumidity = true;
      isValid = false;
    } else if (Number(formDataActivity.minHumidity) < 0 || Number(formDataActivity.minHumidity) > 100) {
      newErrors.minHumidity = true;
      isValid = false;
    } else {
      newErrors.minHumidity = false;
    }

    if (formDataActivity.maxHumidity === '' || isNaN(formDataActivity.maxHumidity)) {
      newErrors.maxHumidity = true;
      isValid = false;
    } else if (Number(formDataActivity.maxHumidity) < 0 || Number(formDataActivity.maxHumidity) > 100) {
      newErrors.maxHumidity = true;
      isValid = false;
    } else {
      newErrors.maxHumidity = false;
    }

    // Validar rango de humedad
    if (!newErrors.minHumidity && !newErrors.maxHumidity &&
      Number(formDataActivity.minHumidity) > Number(formDataActivity.maxHumidity)) {
      newErrors.humidityRange = true;
      isValid = false;
    } else {
      newErrors.humidityRange = false;
    }

    // Validar velocidad del viento
    if (formDataActivity.minWindSpeed === '' || isNaN(formDataActivity.minWindSpeed)) {
      newErrors.minWindSpeed = true;
      isValid = false;
    } else if (Number(formDataActivity.minWindSpeed) < 0) {
      newErrors.minWindSpeed = true;
      isValid = false;
    } else {
      newErrors.minWindSpeed = false;
    }

    if (formDataActivity.maxWindSpeed === '' || isNaN(formDataActivity.maxWindSpeed)) {
      newErrors.maxWindSpeed = true;
      isValid = false;
    } else if (Number(formDataActivity.maxWindSpeed) < 0) {
      newErrors.maxWindSpeed = true;
      isValid = false;
    } else {
      newErrors.maxWindSpeed = false;
    }

    // Validar rango de velocidad del viento
    if (!newErrors.minWindSpeed && !newErrors.maxWindSpeed &&
      Number(formDataActivity.minWindSpeed) > Number(formDataActivity.maxWindSpeed)) {
      newErrors.windSpeedRange = true;
      isValid = false;
    } else {
      newErrors.windSpeedRange = false;
    }

    // Validar que haya al menos un clima seleccionado
    if (!formDataActivity.weatherIds || formDataActivity.weatherIds.length === 0) {
      newErrors.weatherIds = true;
      isValid = false;
    } else {
      newErrors.weatherIds = false;
    }

    // Validar que haya al menos un tag seleccionado
    if (!formDataActivity.tagIds || formDataActivity.tagIds.length === 0) {
      newErrors.tagIds = true;
      isValid = false;
    } else {
      newErrors.tagIds = false;
    }

    setError(newErrors);
    return isValid;
  };

  // Esta función resetea el formulario a los valores originales
  const resetForm = () => {
    setFormDataActivity({
      name: activity.name,
      minTemperature: activity.minTemperature,
      maxTemperature: activity.maxTemperature,
      minHumidity: activity.minHumidity,
      maxHumidity: activity.maxHumidity,
      minWindSpeed: activity.minWindSpeed,
      maxWindSpeed: activity.maxWindSpeed,
      weatherIds: activity.weathers.map(weather => weather.id),
      tagIds: activity.tags.map(tag => tag.id)
    });
    
    setError({
      name: false,
      minTemperature: false,
      maxTemperature: false,
      temperatureRange: false,
      minHumidity: false,
      maxHumidity: false,
      humidityRange: false,
      minWindSpeed: false,
      maxWindSpeed: false,
      windSpeedRange: false,
      weatherIds: false,
      tagIds: false
    });
  };
  
  useEffect(() => {
    // Encuentra el modal padre
    const modalElement = ref.current?.closest('.modal');
    
    if (modalElement) {
      // Función para resetear al cerrar
      const handleModalHidden = () => {
        resetForm();
      };
      
      // Añadir el event listener
      modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
      
      // Limpiar el listener cuando el componente se desmonte
      return () => {
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
      };
    }
  }, [activity]); // Dependencia de activity para que se actualice si cambia
  
  return (
    <form ref={ref} onSubmit={(e) => {
      e.preventDefault();
      if (!validateForm()) {
        return;
      }

      if (
        formDataActivity.name === activity.name &&
        formDataActivity.minTemperature === activity.minTemperature &&
        formDataActivity.maxTemperature === activity.maxTemperature &&
        formDataActivity.minHumidity === activity.minHumidity &&
        formDataActivity.maxHumidity === activity.maxHumidity &&
        formDataActivity.minWindSpeed === activity.minWindSpeed &&
        formDataActivity.maxWindSpeed === activity.maxWindSpeed &&
        JSON.stringify(formDataActivity.weatherIds.sort()) ===
        JSON.stringify(activity.weathers.map(w => w.id).sort()) &&
        JSON.stringify(formDataActivity.tagIds.sort()) ===
        JSON.stringify(activity.tags.map(t => t.id).sort())
      ) {
        document.querySelector('#closeModal').click();
        return; // No ha cambiado nada, no enviar la solicitud
      }

      handleSubmit(formDataActivity);

      setError({
        name: false,
        minTemperature: false,
        maxTemperature: false,
        temperatureRange: false,
        minHumidity: false,
        maxHumidity: false,
        humidityRange: false,
        minWindSpeed: false,
        maxWindSpeed: false,
        windSpeedRange: false
      });

      document.querySelector('#closeModal').click();
    }}>
      {/* Nombre de la actividad */}
      < div className="mb-3" >
        <label htmlFor="activityName" className="form-label fw-semibold">Nombre de la Actividad</label>
        <input
          type="text"
          className={`form-control`}
          id="activityName"
          placeholder="Ingrese el nombre de la actividad"
          value={formDataActivity.name}
          onChange={(e) => setFormDataActivity({ ...formDataActivity, name: e.target.value })}
          required
          disabled
        />
      </div >

      {/* Temperatura */}
      < div className="row mb-3" >
        <div className="col">
          <label htmlFor="minTemperature" className="form-label fw-semibold">Temperatura Mínima (°C)</label>
          <input
            type="number"
            className={`form-control ${error.minTemperature ? 'is-invalid' : ''}`}
            id="minTemperature"
            placeholder="Min"
            value={formDataActivity.minTemperature}
            onChange={(e) => setFormDataActivity({ ...formDataActivity, minTemperature: e.target.value })}
          />
          {error.minTemperature && <div className="invalid-feedback">La temperatura debe estar entre -273°C y 100°C</div>}
        </div>
        <div className="col">
          <label htmlFor="maxTemperature" className="form-label fw-semibold">Temperatura Máxima (°C)</label>
          <input
            type="number"
            className={`form-control ${error.maxTemperature ? 'is-invalid' : ''}`}
            id="maxTemperature"
            placeholder="Max"
            value={formDataActivity.maxTemperature}
            onChange={(e) => setFormDataActivity({ ...formDataActivity, maxTemperature: e.target.value })}
          />
          {error.maxTemperature && <div className="invalid-feedback">La temperatura debe estar entre -273°C y 100°C</div>}
        </div>
      </div >
      {
        error.temperatureRange && (
          <div className="alert alert-danger py-1 mb-3" role="alert">
            La temperatura máxima debe ser mayor que la mínima
          </div>
        )
      }

      {/* Humedad */}
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="minHumidity" className="form-label fw-semibold">Humedad Mínima (%)</label>
          <input
            type="number"
            className={`form-control ${error.minHumidity ? 'is-invalid' : ''}`}
            id="minHumidity"
            placeholder="Min"
            value={formDataActivity.minHumidity}
            onChange={(e) => setFormDataActivity({ ...formDataActivity, minHumidity: e.target.value })}
          />
          {error.minHumidity && <div className="invalid-feedback">La humedad debe estar entre 0% y 100%</div>}
        </div>
        <div className="col">
          <label htmlFor="maxHumidity" className="form-label fw-semibold">Humedad Máxima (%)</label>
          <input
            type="number"
            className={`form-control ${error.maxHumidity ? 'is-invalid' : ''}`}
            id="maxHumidity"
            placeholder="Max"
            value={formDataActivity.maxHumidity}
            onChange={(e) => setFormDataActivity({ ...formDataActivity, maxHumidity: e.target.value })}
          />
          {error.maxHumidity && <div className="invalid-feedback">La humedad debe estar entre 0% y 100%</div>}
        </div>
      </div>
      {
        error.humidityRange && (
          <div className="alert alert-danger py-1 mb-3" role="alert">
            La humedad máxima debe ser mayor que la mínima
          </div>
        )
      }

      {/* Velocidad del viento */}
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="minWindSpeed" className="form-label fw-semibold">Vel. Viento Mínima (m/s)</label>
          <input
            type="number"
            className={`form-control ${error.minWindSpeed ? 'is-invalid' : ''}`}
            id="minWindSpeed"
            placeholder="Min"
            value={formDataActivity.minWindSpeed}
            onChange={(e) => setFormDataActivity({ ...formDataActivity, minWindSpeed: e.target.value })}
          />
          {error.minWindSpeed && <div className="invalid-feedback">La velocidad del viento debe ser mayor o igual a 0</div>}
        </div>
        <div className="col">
          <label htmlFor="maxWindSpeed" className="form-label fw-semibold">Vel. Viento Máxima (m/s)</label>
          <input
            type="number"
            className={`form-control ${error.maxWindSpeed ? 'is-invalid' : ''}`}
            id="maxWindSpeed"
            placeholder="Max"
            value={formDataActivity.maxWindSpeed}
            onChange={(e) => setFormDataActivity({ ...formDataActivity, maxWindSpeed: e.target.value })}
          />
          {error.maxWindSpeed && <div className="invalid-feedback">La velocidad del viento debe ser mayor o igual a 0</div>}
        </div>
      </div>
      {
        error.windSpeedRange && (
          <div className="alert alert-danger py-1 mb-3" role="alert">
            La velocidad del viento máxima debe ser mayor que la mínima
          </div>
        )
      }

      {/* Climas compatibles */}
      <div className="mb-3">
        <label htmlFor="weatherIds" className="form-label fw-semibold">Climas compatibles</label>
        <Select
          id="weatherIds"
          name="weatherIds"
          isMulti
          options={weathers.map(weather => ({
            value: weather.id,
            label: weather.name,
          }))}
          value={formDataActivity.weatherIds.map((id) => {
            const weather = weathers.find(w => w.id === id);
            return {
              value: id,
              label: weather ? weather.name : `Clima ${id}`,
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
          placeholder="Seleccione climas"
          className={`basic-multi-select ${error.weatherIds ? 'is-invalid' : ''}`}
          classNamePrefix="select"
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: error.weatherIds ? '#dc3545' : baseStyles.borderColor,
              boxShadow: error.weatherIds ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)' : baseStyles.boxShadow,
            }),
          }}
        />
        {error.weatherIds && <div className="text-danger mt-1">Debe seleccionar al menos un clima</div>}
      </div>

      {/* Tags */}
      <div className="mb-3">
        <label htmlFor="tagIds" className="form-label fw-semibold">Tags</label>
        <Select
          id="tagIds"
          name="tagIds"
          isMulti
          options={tags.map(tag => ({
            value: tag.id,
            label: tag.name,
          }))}
          value={formDataActivity.tagIds.map((id) => {
            const tag = tags.find(t => t.id === id);
            return {
              value: id,
              label: tag ? tag.name : `Tag ${id}`,
            };
          })}
          onChange={(selected) => {
            setFormDataActivity({
              ...formDataActivity,
              tagIds: selected
                ? selected.map((option) => option.value)
                : [],
            });
          }}
          placeholder="Seleccione tags"
          className={`basic-multi-select ${error.tagIds ? 'is-invalid' : ''}`}
          classNamePrefix="select"
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: error.tagIds ? '#dc3545' : baseStyles.borderColor,
              boxShadow: error.tagIds ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)' : baseStyles.boxShadow,
            }),
          }}
        />
        {error.tagIds && <div className="text-danger mt-1">Debe seleccionar al menos un tag</div>}
      </div>
    </form >
  )
})

export default DActivityUpdateForm;