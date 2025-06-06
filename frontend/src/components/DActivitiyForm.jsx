import { forwardRef, useState } from "react"
import Select from "react-select";

const DActivityForm = forwardRef(({ tags, weathers, handleSubmit }, ref) => {
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
    windSpeedRange: false
  });
  
  const [formDataActivity, setFormDataActivity] = useState({
    name: '',
    minTemperature: '',
    maxTemperature: '',
    minHumidity: '',
    maxHumidity: '',
    minWindSpeed: '',
    maxWindSpeed: '',
    weatherIds: [],
    tagIds: []
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
    
    setError(newErrors);
    return isValid;
  };

  return (
    <form ref={ref} onSubmit={(e) => {
      e.preventDefault();
      if (!validateForm()) {
        return;
      }
      
      handleSubmit(formDataActivity);
      
      // Resetear formulario
      setFormDataActivity({
        name: '',
        minTemperature: '',
        maxTemperature: '',
        minHumidity: '',
        maxHumidity: '',
        minWindSpeed: '',
        maxWindSpeed: '',
        weatherIds: [],
        tagIds: []
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
        windSpeedRange: false
      });
      
      document.querySelector('#closeModal').click();
    }}>
      {/* Nombre de la actividad */}
      <div className="mb-3">
        <label htmlFor="activityName" className="form-label fw-semibold">Nombre de la Actividad</label>
        <input
          type="text"
          className={`form-control ${error.name ? 'is-invalid' : ''}`}
          id="activityName"
          placeholder="Ingrese el nombre de la actividad"
          value={formDataActivity.name}
          onChange={(e) => setFormDataActivity({...formDataActivity, name: e.target.value})}
          required
        />
        {error.name && <div className="invalid-feedback">El nombre es obligatorio</div>}
      </div>

      {/* Temperatura */}
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="minTemperature" className="form-label fw-semibold">Temperatura Mínima (°C)</label>
          <input
            type="number"
            className={`form-control ${error.minTemperature ? 'is-invalid' : ''}`}
            id="minTemperature"
            placeholder="Min"
            value={formDataActivity.minTemperature}
            onChange={(e) => setFormDataActivity({...formDataActivity, minTemperature: e.target.value})}
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
            onChange={(e) => setFormDataActivity({...formDataActivity, maxTemperature: e.target.value})}
          />
          {error.maxTemperature && <div className="invalid-feedback">La temperatura debe estar entre -273°C y 100°C</div>}
        </div>
      </div>
      {error.temperatureRange && (
        <div className="alert alert-danger py-1 mb-3" role="alert">
          La temperatura máxima debe ser mayor que la mínima
        </div>
      )}

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
            onChange={(e) => setFormDataActivity({...formDataActivity, minHumidity: e.target.value})}
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
            onChange={(e) => setFormDataActivity({...formDataActivity, maxHumidity: e.target.value})}
          />
          {error.maxHumidity && <div className="invalid-feedback">La humedad debe estar entre 0% y 100%</div>}
        </div>
      </div>
      {error.humidityRange && (
        <div className="alert alert-danger py-1 mb-3" role="alert">
          La humedad máxima debe ser mayor que la mínima
        </div>
      )}

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
            onChange={(e) => setFormDataActivity({...formDataActivity, minWindSpeed: e.target.value})}
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
            onChange={(e) => setFormDataActivity({...formDataActivity, maxWindSpeed: e.target.value})}
          />
          {error.maxWindSpeed && <div className="invalid-feedback">La velocidad del viento debe ser mayor o igual a 0</div>}
        </div>
      </div>
      {error.windSpeedRange && (
        <div className="alert alert-danger py-1 mb-3" role="alert">
          La velocidad del viento máxima debe ser mayor que la mínima
        </div>
      )}

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
          className="basic-multi-select"
          classNamePrefix="select"
        />
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
          className="basic-multi-select"
          classNamePrefix="select"
        />
      </div>
    </form>
  )
})

export default DActivityForm;