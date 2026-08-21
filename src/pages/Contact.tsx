import React, { useState } from 'react';
import './Contact.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.correo || !formData.mensaje) return;

    setSubmitted(true);
    setTimeout(() => {
      setFormData({ nombre: '', correo: '', asunto: '', mensaje: '' });
    }, 3000);
  };

  return (
    <div className="container">
      <section className="section-header">
        <h1 className="section-title">Canales de Contacto Oficial</h1>
        <p className="section-subtitle">
          Comunicación directa con la dirección del proyecto y seminario académico.
        </p>
      </section>

      {/* Tarjetas de Canales Oficiales */}
      <div className="grid-3" style={{ marginBottom: '3rem' }}>
        <div className="card">
          <span className="tag-label">Canal Oficial</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            Correo Institucional
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            kevin.sanhueza@seminario.cl
          </p>
        </div>

        <div className="card">
          <span className="tag-label">Programa</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            Programa Académico
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Seminario de Práctica Profesional - Ingeniería
          </p>
        </div>

        <div className="card">
          <span className="tag-label">Disponibilidad</span>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            Horario de Atención
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Lunes a Viernes: 09:00 - 18:00 hrs
          </p>
        </div>
      </div>

      {/* Formulario Estructurado */}
      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
          Enviar Mensaje Directo
        </h2>

        {submitted && (
          <div className="alert alert-success">
            Mensaje recibido correctamente. Nos pondremos en contacto a la brevedad.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Carlos Mendoza"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                type="email"
                id="correo"
                name="correo"
                className="form-control"
                value={formData.correo}
                onChange={handleChange}
                placeholder="carlos.mendoza@empresa.cl"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="asunto">Asunto de Consulta</label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              className="form-control"
              value={formData.asunto}
              onChange={handleChange}
              placeholder="Ej. Solicitud de validación de datos"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              name="mensaje"
              className="form-control"
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Escribe tu consulta o requerimiento técnico aquí..."
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Enviar Mensaje
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;