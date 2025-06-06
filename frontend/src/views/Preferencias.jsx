import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/user.module.css';
import api from '../api/api';
import { activityService } from '../services/admin';
 
function Preferencias() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    minTemperature: '',
    maxTemperature: '',
    minHumidity: '',
    maxHumidity: '',
    minWindSpeed: '',
    maxWindSpeed: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('activityToken');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await api.get('/activity', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setActivities(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener actividades:', err);
      setError('Error al cargar las actividades. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setFormData({
      name: activity.name,
      minTemperature: activity.minTemperature,
      maxTemperature: activity.maxTemperature,
      minHumidity: activity.minHumidity,
      maxHumidity: activity.maxHumidity,
      minWindSpeed: activity.minWindSpeed,
      maxWindSpeed: activity.maxWindSpeed
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('activityToken');
      if (!token) throw new Error('No hay token de autenticación');

      // Verificar y validar los datos
      const payload = {
        name: formData.name,
        minTemperature: parseFloat(formData.minTemperature),
        maxTemperature: parseFloat(formData.maxTemperature),
        minHumidity: parseInt(formData.minHumidity),
        maxHumidity: parseInt(formData.maxHumidity),
        minWindSpeed: parseFloat(formData.minWindSpeed),
        maxWindSpeed: parseFloat(formData.maxWindSpeed)
      };

      // Validaciones
      if (payload.minTemperature > payload.maxTemperature) {
        throw new Error('La temperatura mínima no puede ser mayor que la máxima');
      }
      
      if (payload.minHumidity > payload.maxHumidity) {
        throw new Error('La humedad mínima no puede ser mayor que la máxima');
      }
      
      if (payload.minWindSpeed > payload.maxWindSpeed) {
        throw new Error('La velocidad mínima del viento no puede ser mayor que la máxima');
      }

      // Actualizar la actividad
      await api.put(`/activity/${selectedActivity.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      alert('Actividad actualizada correctamente');
      // Recargar las actividades para reflejar los cambios
      fetchActivities();
      setSelectedActivity(null);
    } catch (err) {
      console.error('Error al actualizar la actividad:', err);
      alert(err.message || 'Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedActivity(null);
  };

  return (
    <div className="container">
      <h2 className="text-center my-3">Menú de actividades</h2>
      <hr />
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!selectedActivity ? (
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
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
                        <p className="fs-6 fw-normal mb-0 text-truncate">{activity.name}</p>
                        <i className="fas fa-chevron-right text-primary"></i>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center">No hay actividades disponibles</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card shadow p-4 mb-4">
              <h3 className="mb-3">Editar actividad</h3>
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
      )}
    </div>
  );
}

export default Preferencias;
