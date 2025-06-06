import React, { useState, useEffect } from "react";
import { activityService, weatherService } from "../services/admin";
import "../App.css";
import Select from "react-select";
import Sidebar from "../components/Sidebar";
import { faCloud, faHammer, faPersonRunning, faTag } from "@fortawesome/free-solid-svg-icons";
import adminService from '../services/admin'
import Modal from "../components/Modal";

const TagsTable = ({ tags, handleDelete }) => {
  
  return (
    <>
      <table className="table table-striped table-hover ">
        <thead>
          <tr>
            <th scope="col" className="text-center align-middle">id</th>
            <th scope="col" className="text-center align-middle">Nombre</th>
            <th scope="col" className="text-center align-middle">Acciones</th>
          </tr>
        </thead>
        <tbody className="">
          {tags.map((tag, index) => (
            <tr style={{ cursor: 'pointer' }} onClick={() => console.log("bruh")} key={index}>
              <th scope="row" className="align-middle">{tag.id}</th>
              <td className="text-center align-middle">{tag.name}</td>
              <td className="text-center align-middle">
                <button type="button" onClick={(e) => e.stopPropagation()} className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target={`#modal-tag-${activity.id}`}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modals*/}
      {tags.map((tag, index) => (
        <Modal
          key={index}
          id={`modal-dactivity-${tag.id}`}
          title="Borrar Tag"
          text={`¿Estás seguro de desea borrar el tag "${tag.name}"? Esta acción no se puede deshacer.`}
          buttonText="Borrar"
          buttonClass="btn-danger"
          onConfirm={() => handleDelete(tag.id)}
        />
        ))}
    </>
  )
}

const AdminTags = () => {
  const [tags, setTags] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      const newTags = await adminService.getTags();
      console.log(newTags);
      setTags(newTags);
    };
    fetchActivities();
  }, [])

  const handleDelete = async (id) => {
    const success = await adminService.deleteTag(id);
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
            { title: "Actividades Default", link: '/admin/activities', icon: faPersonRunning, isActive: false },
            { title: "Tags", link: '/admin/tags', icon: faTag, isActive: true }
          ]}
        />
        <div className="flex-grow-1 p-4">
          <h2>Tags</h2>
          {tags && <TagsTable tags={tags} handleDelete={handleDelete} />}
        </div>
      </div>
    </>
  )

}

export default AdminTags;
