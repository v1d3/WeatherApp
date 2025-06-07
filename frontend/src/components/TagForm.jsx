import { forwardRef, useState } from "react"

const TagForm = forwardRef(({ handleSubmit }, ref) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  return (
    <form ref={ref} onSubmit={(e) => {
      e.preventDefault();
      if(name === ''){
        setError(true);
        return;
      }
      setName('');
      setError('');
      handleSubmit({ name });
      document.querySelector('#closeModal').click();
    }}>
      <div className="mb-3">
        <label htmlFor="tagName" className="form-label fw-semibold">Nombre del Tag</label>
        <input
          type="text"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          id="tagName"
          placeholder="Ingrese el nombre"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
    </form>
  )
})

export default TagForm;