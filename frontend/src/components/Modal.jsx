const Modal = ({id, title, text, buttonText, buttonClass, onConfirm}) => {

  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={`${id}-label`} aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id={`${id}-label`}>{title}</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {text}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button onClick={onConfirm} type="button" className={`btn btn-primary ${buttonClass}`} data-bs-dismiss="modal">{buttonText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal;