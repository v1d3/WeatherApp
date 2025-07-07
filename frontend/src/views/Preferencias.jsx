import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/user.module.css';
import api from '../api/api';
import { weatherService } from '../services/admin';
import activityService from '../services/activity';
import Select from 'react-select';
 
function Preferencias() {
  const [activities, setActivities] = useState([]);
  const [weatherNames, setWeatherNames] = useState([]);
  const [tags, setTags] = useState([]); // Estado para tags
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    minTemperature: '',
    maxTemperature: '',
    minHumidity: '',
    maxHumidity: '',
    minWindSpeed: '',
    maxWindSpeed: '',
    weatherIds: [],
    tagIds: [] // Añadir campo para tagIds
  });

  useEffect(() => {
    fetchActivities();
    fetchWeatherNames();
    fetchTags(); // Añadir llamada para obtener los tags
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('activityToken');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await api.get('/activity');
      console.log(response.data)
      setActivities(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener actividades:', err);
      setError('Error al cargar las actividades. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherNames = async () => {
    try {
      const names = await weatherService.getWeatherNames();
      setWeatherNames(names);
    } catch (err) {
      console.error('Error al cargar nombres del clima:', err);
      setError('Error al cargar tipos de clima disponibles.');
    }
  };

  // Añadir función para cargar tags
  const fetchTags = async () => {
    try {
      const response = await api.get('/tag', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('activityToken')}`
        }
      });
      setTags(response.data);
    } catch (err) {
      console.error('Error al cargar tags:', err);
      setError('Error al cargar los tags disponibles.');
    }
  };

  const handleActivityClick = (activity) => {
    setIsCreating(false);
    setSelectedActivity(activity);
    setFormData({
      name: activity.name,
      minTemperature: activity.minTemperature,
      maxTemperature: activity.maxTemperature,
      minHumidity: activity.minHumidity,
      maxHumidity: activity.maxHumidity,
      minWindSpeed: activity.minWindSpeed,
      maxWindSpeed: activity.maxWindSpeed,
      weatherIds: activity.weathers.map(w => w.id),
      tagIds: activity.tags ? activity.tags.map(t => t.id) : [] // Cargar tags
    });
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedActivity(null);
    setFormData({
      name: '',
      minTemperature: '',
      maxTemperature: '',
      minHumidity: '',
      maxHumidity: '',
      minWindSpeed: '',
      maxWindSpeed: '',
      weatherIds: [],
      tagIds: [] // Reiniciar los tags
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Modificar validateFormData para incluir validación de tags
  const validateFormData = (data) => {
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre de la actividad es obligatorio');
    }
    
    if (data.minTemperature > data.maxTemperature) {
      throw new Error('La temperatura mínima no puede ser mayor que la máxima');
    }
    
    if (data.minHumidity > data.maxHumidity) {
      throw new Error('La humedad mínima no puede ser mayor que la máxima');
    }
    
    if (data.minWindSpeed > data.maxWindSpeed) {
      throw new Error('La velocidad mínima del viento no puede ser mayor que la máxima');
    }

    if (data.weatherIds.length === 0) {
      throw new Error('Debe seleccionar al menos un tipo de clima compatible');
    }

    // Validar que haya al menos un tag seleccionado
    if (!data.tagIds || data.tagIds.length === 0) {
      throw new Error('Debe seleccionar al menos un tag');
    }

    return true;
  };

  const handleSubmit = async (e) => {
    console.log(selectedActivity);
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('activityToken');
      if (!token) throw new Error('No hay token de autenticación');

      // Preparar payload con tags incluidos
      const payload = {
        name: formData.name,
        minTemperature: parseFloat(formData.minTemperature),
        maxTemperature: parseFloat(formData.maxTemperature),
        minHumidity: parseInt(formData.minHumidity),
        maxHumidity: parseInt(formData.maxHumidity),
        minWindSpeed: parseFloat(formData.minWindSpeed),
        maxWindSpeed: parseFloat(formData.maxWindSpeed),
        weatherIds: formData.weatherIds,
        tagIds: formData.tagIds // Añadir tagIds al payload
      };

      // Validaciones
      validateFormData(payload);

      if (isCreating) {
        // Crear nueva actividad
        const newActivity = await activityService.createActivity(payload);
        alert('Actividad creada correctamente');
        setActivities([newActivity, ...activities]);
      } else {
        // Actualizar actividad existente
        await api.put(`/activity/${selectedActivity.id}`, payload);
        alert('Actividad actualizada correctamente');
      }
      
      // Recargar las actividades para reflejar los cambios
      fetchActivities();
      setSelectedActivity(null);
      setIsCreating(false);
    } catch (err) {
      console.error('Error al procesar la actividad:', err);
      alert(err.message || 'Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedActivity(null);
    setIsCreating(false);
  };

  const renderForm = () => {
    return (
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow p-4 mb-4">
            <h3 className="mb-3">{isCreating ? 'Crear actividad' : 'Editar actividad'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nombre de la actividad</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label htmlFor="minTemperature" className="form-label">Temperatura mínima (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    id="minTemperature"
                    name="minTemperature"
                    value={formData.minTemperature}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="maxTemperature" className="form-label">Temperatura máxima (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    id="maxTemperature"
                    name="maxTemperature"
                    value={formData.maxTemperature}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label htmlFor="minHumidity" className="form-label">Humedad mínima (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="minHumidity"
                    name="minHumidity"
                    value={formData.minHumidity}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="maxHumidity" className="form-label">Humedad máxima (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="maxHumidity"
                    name="maxHumidity"
                    value={formData.maxHumidity}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label htmlFor="minWindSpeed" className="form-label">Velocidad mínima del viento (km/h)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    id="minWindSpeed"
                    name="minWindSpeed"
                    value={formData.minWindSpeed}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="maxWindSpeed" className="form-label">Velocidad máxima del viento (km/h)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    id="maxWindSpeed"
                    name="maxWindSpeed"
                    value={formData.maxWindSpeed}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="weatherIds" className="form-label">Climas compatibles</label>
                <Select
                  isMulti
                  name="weatherIds"
                  options={weatherNames.map((name, index) => ({
                    value: index + 1,
                    label: name
                  }))}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={formData.weatherIds.map(id => ({
                    value: id,
                    label: weatherNames[id - 1] || `Clima ${id}`
                  }))}
                  onChange={(selectedOptions) => {
                    setFormData({
                      ...formData,
                      weatherIds: selectedOptions ? selectedOptions.map(option => option.value) : []
                    });
                  }}
                  placeholder="Seleccione los climas compatibles"
                />
                <small className="form-text text-muted">
                  Seleccione los tipos de clima en los que se puede realizar esta actividad
                </small>
              </div>

              {/* Campo de selección de tags */}
              <div className="mb-3">
                <label htmlFor="tagIds" className="form-label">Tags</label>
                <Select
                  id="tagIds"
                  name="tagIds"
                  isMulti
                  options={tags.map(tag => ({
                    value: tag.id,
                    label: tag.name,
                  }))}
                  value={formData.tagIds.map(id => {
                    const tag = tags.find(t => t.id === id);
                    return tag ? { value: tag.id, label: tag.name } : null;
                  }).filter(Boolean)}
                  onChange={selected => setFormData({
                    ...formData,
                    tagIds: selected ? selected.map(option => option.value) : [],
                  })}
                  placeholder="Seleccione tags"
                />
              </div>
              
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ backgroundColor: '#156DB5' }}
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleDelete = async (activityId, activityName) => {
    if(confirm(`¿Seguro desea borrar ${activityName}?`)){
      setLoading(true);
      try {
        await activityService.deleteActivity(activityId);
        setActivities(activities.filter((activity) => activity.id !== activityId));
      } catch (error) {
        setError('Error al borrar');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="container">
      <h2 className="text-center my-3">Menú de actividades</h2>
      <hr />
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!selectedActivity && !isCreating ? (
        <div className="d-flex align-items-center flex-column">
            {/* Botón de crear actividad */}
              <button 
                className={`btn btn-primary mb-3 ${loading ? 'disabled' : ''}`} 
                onClick={handleCreateNew}
                style={{ backgroundColor: '#156DB5' }}
              >
                <i className="fas fa-plus me-2"></i>Crear actividad
              </button>
            
            <div 
              className={`${styles.cuadroPreferencias} p-3 mb-4`} 
              style={{ 
                borderRadius: '6px', 
                border: '1px solid #0D6EFD', 
                backgroundColor: '#f8f9fa',
                position: 'relative',
                maxHeight: '500px' // Define a max height for the container
              }}
            >
              {loading ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : activities.length > 0 ? (
                <div 
                  className="d-flex flex-column w-100 gap-2"
                  style={{ 
                    overflowY: 'auto',   // Enable vertical scrolling
                    maxHeight: '100%',    // Take full height of parent
                    paddingRight: '5px'   // Add some padding for the scrollbar
                  }}
                >
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="card shadow-sm rounded w-100 overflow-hidden"
                      style={{ cursor: 'pointer', flex: '0 0 auto' }}
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="card-body d-flex align-items-center justify-content-between p-0 px-3" style={{ height: '50px' }}>
                          <div className="d-flex align-items-center w-100">
                          <p className="fs-6 fw-normal mb-0"> {activity.name} </p>
                          <i className="fas fa-chevron-right text-primary ms-auto"></i>
                          </div>
                        {activity.defaultActivityId === null ? <button className="btn btn-sm btn-danger" onClick={(e) => {e.stopPropagation(); handleDelete(activity.id, activity.name)}}>Borrar</button>
                        : <span style={{ fontStyle: 'italic', color: '#156DB5' }}>default</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center">No hay actividades disponibles</p>
              )}
            </div>
          </div>
      ) : (
        renderForm()
      )}
    </div>
  );
}

export default Preferencias;