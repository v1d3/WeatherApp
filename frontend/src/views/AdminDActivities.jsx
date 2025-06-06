import React, { useState, useEffect } from "react";
import { activityService, weatherService } from "../services/admin";
import "../App.css";
import Select from "react-select";
import Sidebar from "../components/Sidebar";
import { faCloud, faHammer, faPersonRunning, faTag } from "@fortawesome/free-solid-svg-icons";
import adminService from '../services/admin'
import Modal from "../components/Modal";

const DActivityTable = ({ dActivities, handleDelete }) => {
  
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
            <tr style={{ cursor: 'pointer' }} onClick={() => console.log("bruh")} key={index}>
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
          onConfirm={() => handleDelete(activity.id)}
        />
        ))}
    </>
  )
}

const AdminDActivities = () => {
  const [dActivities, setDActivities] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      const newActivities = await adminService.getDefaultActivities();
      console.log(newActivities);
      setDActivities(newActivities);
    };
    fetchActivities();
  }, [])

  const handleDelete = async (id) => {
    const success = await adminService.deleteDefaultActivity(id);
    if(success){
      setDActivities(dActivities.filter(dActivity => dActivity.id !== id))
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
        <div className="flex-grow-1 p-4">
          <h2>Actividades Predeterminadas</h2>
          {dActivities && <DActivityTable dActivities={dActivities} handleDelete={handleDelete} />}
        </div>
      </div>
    </>
  )

}

export default AdminDActivities;
