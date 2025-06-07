import React, { useState, useEffect, useRef } from "react";
import { activityService, weatherService } from "../services/admin";
import "../App.css";
import Select from "react-select";
import Sidebar from "../components/Sidebar";
import { faCloud, faHammer, faPersonRunning, faTag } from "@fortawesome/free-solid-svg-icons";
import adminService from '../services/admin'
import Modal from "../components/Modal";
import TagForm from "../components/TagForm";

const ModalAdd = ({ handleSubmit, isLoading }) => {
  const formRef = useRef(null);

  return (
    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Añadir nuevo Tag
              {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" disabled={isLoading}></button>
          </div>
          <div className="modal-body">
            <TagForm ref={formRef} handleSubmit={handleSubmit} />
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
              ) : 'Añadir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const TagsTable = ({ tags, handleDelete, isLoading }) => {
  return (
    <>
      <table className="table table-striped table-hover">
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
                <button 
                  type="button" 
                  onClick={(e) => e.stopPropagation()} 
                  className="btn btn-sm btn-danger" 
                  data-bs-toggle="modal" 
                  data-bs-target={`#modal-tag-${tag.id}`}
                  disabled={isLoading}
                >
                  {isLoading ? 
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 
                    'Borrar'
                  }
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modals*/}
      {tags.map((tag, index) => (
        <Modal
          key={index}
          id={`modal-tag-${tag.id}`}
          title="Borrar Tag"
          text={`¿Estás seguro de desea borrar el tag "${tag.name}"? Esta acción no se puede deshacer.`}
          buttonText={isLoading ? "Procesando..." : "Borrar"}
          buttonClass="btn-danger"
          onConfirm={() => handleDelete(tag.id)}
        />
      ))}
    </>
  )
}

const AdminTags = () => {
  const [tags, setTags] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const newTags = await adminService.getTags();
        setTags(newTags);
      } catch (error) {
        console.error("Error al cargar tags:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, [])

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const success = await adminService.deleteTag(id);
      if(success){
        setTags(tags.filter(tag => tag.id !== id));
      } else{
        alert('Error, no se pudo borrar')
      }
    } catch (error) {
      console.error("Error al eliminar tag:", error);
      alert('Error, no se pudo borrar');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddTag = async (tagData) => {
    setIsLoading(true);
    try {
      const newTag = await adminService.createTag(tagData);
      if (newTag) {
        setTags([...tags, newTag]);
      }
    } catch (error) {
      console.error("Error al crear tag:", error);
      alert('Error al crear el tag');
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="d-flex flex-column flex-grow-1 p-4">
          <div className="d-flex align-items-center mb-3 position-relative">
            {/* Título centrado */}
            <div className="w-100 text-center">
              <h2 className="mb-0">
                Tags
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
                ) : '+ Añadir Tag'}
              </button>
            </div>
          </div>
          {!tags ? (
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
                     style={{zIndex: 1, top: 0, left: 0}}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              )}
              <TagsTable tags={tags} handleDelete={handleDelete} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>
      <ModalAdd handleSubmit={handleAddTag} isLoading={isLoading} />
    </>
  );
}

export default AdminTags;
