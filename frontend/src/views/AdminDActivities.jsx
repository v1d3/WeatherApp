import React, { useState, useEffect, useRef } from "react";
import * as bootstrap from 'bootstrap'; // Añade esta importación
import { activityService, weatherService } from "../services/admin";
import "../App.css";
import Select from "react-select";
import Sidebar from "../components/Sidebar";
import { faCloud, faHammer, faPersonRunning, faTag } from "@fortawesome/free-solid-svg-icons";
import adminService from '../services/admin'
import Modal from "../components/Modal";
import DActivityForm from "../components/DActivitiyForm";
import api from "../api/api";
import DActivityUpdateForm from "../components/DActivityUpdateForm";

const ModalUpdate = ({ id, handleSubmit, weathers, tags, isLoading, activity }) => {
  const formRef = useRef(null);

  return (
    <div className="modal fade" id={id} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">
              Detalles Actividad
              {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" disabled={isLoading}></button>
          </div>
          <div className="modal-body">
            <DActivityUpdateForm ref={formRef} handleSubmit={handleSubmit} weathers={weathers} tags={tags} activity={activity} />
          </div>
          <div className="modal-footer">
            <button id="closeModal" type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={isLoading}>Cancelar</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ModalAdd = ({ handleSubmit, weathers, tags, isLoading }) => {
  const formRef = useRef(null);

  return (
    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Añadir nueva Actividad
              {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" disabled={isLoading}></button>
          </div>
          <div className="modal-body">
            <DActivityForm ref={formRef} handleSubmit={handleSubmit} weathers={weathers} tags={tags} />
          </div>
          <div className="modal-footer">
            <button id="closeAddModal" type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={isLoading}>Cancelar</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : 'Añadir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const DActivityTable = ({ dActivities, handleDelete, isLoading, handlePut, weathers, tags }) => {

  return (
    <>
      <table className="table table-striped table-hover ">
        <thead>
          <tr>
            <th scope="col" className="text-center align-middle">id</th>
            <th scope="col" className="text-center align-middle">Nombre</th>
            <th scope="col" className="text-center align-middle">T min (°C)</th>
            <th scope="col" className="text-center align-middle">T max (°C)</th>
            <th scope="col" className="text-center align-middle">Humedad min (%)</th>
            <th scope="col" className="text-center align-middle">Humedad max (%)</th>
            <th scope="col" className="text-center align-middle">Viento min (m/s)</th>
            <th scope="col" className="text-center align-middle">Viento max (m/s)</th>
            <th scope="col" className="text-center align-middle">Acciones</th>
          </tr>
        </thead>
        <tbody className="">
          {dActivities.map((activity, index) => (
            <tr style={{ cursor: 'pointer' }} onClick={() => {
              // Abre el modal de actualización para esta actividad
              const modalElement = document.querySelector(`#modal-dactivity-put-${activity.id}`);
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            }} key={index}>
              <th scope="row" className="align-middle">{activity.id}</th>
              <td className="text-center align-middle">{activity.name}</td>
              <td className="text-center align-middle">{activity.minTemperature}</td>
              <td className="text-center align-middle">{activity.maxTemperature}</td>
              <td className="text-center align-middle">{activity.minHumidity}</td>
              <td className="text-center align-middle">{activity.maxHumidity}</td>
              <td className="text-center align-middle">{activity.minWindSpeed}</td>
              <td className="text-center align-middle">{activity.maxWindSpeed}</td>
              <td className="text-center align-middle">
                <button type="button" onClick={(e) => e.stopPropagation()} className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target={`#modal-dactivity-${activity.id}`}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modals*/}
      {dActivities.map((activity, index) => (
        <Modal
          key={index}
          id={`modal-dactivity-${activity.id}`}
          title="Borrar Actividad"
          text={`¿Estás seguro de que quieres borrar la actividad "${activity.name}"? Esta acción no se puede deshacer.`}
          buttonText="Borrar"
          buttonClass="btn-danger"
          onConfirm={() => handleDelete(activity.id)} />
      ))}
      {dActivities.map((activity, index) => (
        <ModalUpdate
          key={index}
          id={`modal-dactivity-put-${activity.id}`}
          weathers={weathers}
          tags={tags}
          isLoading={isLoading}
          handleSubmit={(data) => handlePut(activity.id, data)}
          activity={activity} 
        />
      ))}
    </>
  )
}

const AdminDActivities = () => {
  const [dActivities, setDActivities] = useState(null);
  const [tags, setTags] = useState(null);
  const [weathers, setWeathers] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para controlar la carga


  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)
      const newActivities = await adminService.getDefaultActivities();
      console.log(newActivities);
      setDActivities(newActivities);
      setIsLoading(false)

    };
    fetchActivities();
  }, [])

  console.log(dActivities)

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      const newTags = await adminService.getTags();
      console.log(newTags);
      setTags(newTags);
      setIsLoading(false)

    };
    fetchTags();
  }, [])

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true)
      const newWeathers = await adminService.getWeathers();
      console.log(newWeathers);
      setWeathers(newWeathers);
      setIsLoading(false)
    };
    fetchWeather();
  }, [])

  const handleAddDActivity = async (dActivity) => {
    try {
      setIsLoading(true); // Mostrar indicador de carga
      const newActivity = await adminService.createDefaultActivity(dActivity);
      if (newActivity && newActivity.id) {
      // Agregar solo si la respuesta contiene datos válidos
        setDActivities([...dActivities, newActivity]);
        return true;
      }else{
        alert('Error al añadir');
      }
      return false;
    } catch (error) {
      console.log(error);
      return false; // Indicar fallo
    } finally {
      setIsLoading(false); // Ocultar indicador de carga independientemente del resultado
    }
  }

  const handleDelete = async (id) => {
    try {
      setIsLoading(true); // Mostrar indicador de carga
      const success = await adminService.deleteDefaultActivity(id);
      if (success) {
        setDActivities(dActivities.filter(dActivity => dActivity.id !== id));
      } else {
        alert('Error, no se pudo borrar');
      }
      return success;
    } finally {
      setIsLoading(false); // Ocultar indicador de carga independientemente del resultado
    }
  }

  const handlePut = async (id, activityData) => {
    try {
      setIsLoading(true);
      const success = await adminService.updateDefaultActivity(id, activityData);
      if (success) {
        // Actualizar la actividad en el estado local
        setDActivities(dActivities.map(activity => 
          activity.id === id ? {...activity, ...activityData} : activity
        ));
        return true;
      } else {
        alert('Error, no se pudo actualizar');
        return false;
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert('Error en la actualización: ' + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="d-flex">
        <Sidebar
          title="Administrador"
          mainIcon={faHammer}
          sections={[
            { title: "Actividades Default", link: '/admin/activities', icon: faPersonRunning, isActive: true },
            { title: "Tags", link: '/admin/tags', icon: faTag, isActive: false }
          ]}
        />
        <div className="d-flex flex-column flex-grow-1 p-4">
          <div className="d-flex align-items-center mb-3 position-relative">
            {/* Título centrado */}
            <div className="w-100 text-center">
              <h2 className="mb-0">
                Actividades Predeterminadas
              </h2>
            </div>

            {/* Botón posicionado absolutamente a la derecha */}
            <div className="position-absolute end-0">
              <button
                className="btn btn-md btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : '+ Añadir Actividad'}
              </button>
            </div>
          </div>

          {/* Tabla o spinner de carga */}
          {!dActivities ? (
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="position-relative">
              {/* Overlay de carga semitransparente durante peticiones */}
              {isLoading && (
                <div className="position-absolute w-100 h-100 bg-light bg-opacity-75 d-flex justify-content-center align-items-center"
                  style={{ zIndex: 1, top: 0, left: 0 }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              )}
              <DActivityTable dActivities={dActivities} handleDelete={handleDelete}
                weathers={weathers} tags={tags} isLoading={isLoading} handlePut={handlePut} />
            </div>
          )}
        </div>
      </div>
      {weathers && tags && <ModalAdd handleSubmit={handleAddDActivity} weathers={weathers} tags={tags} isLoading={isLoading} />}
    </>
  )

}

export default AdminDActivities;
