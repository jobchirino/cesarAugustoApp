'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api, { getAuthToken } from '@/lib/api';

interface Grado {
  id: number;
  grado: string;
  seccion: string;
  docente: string;
  created_at?: string;
  updated_at?: string;
}

interface Errors {
  [key: string]: string;
}

export default function GradosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [grados, setGrados] = useState<Grado[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrado, setEditingGrado] = useState<Grado | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    grado: '',
    seccion: '',
    docente: '',
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/security-questions/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.configured) {
          router.push('/setup-security');
        }
      })
      .catch(() => {
        router.push('/login');
      });

    fetchGrados();
  }, [router]);

  const fetchGrados = () => {
    api.get('/grados-secciones')
      .then((res) => {
        setGrados(res.data);
      })
      .catch((err) => {
        console.error('Error al obtener grados:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const openModal = (grado?: Grado) => {
    if (grado) {
      setEditingGrado(grado);
      setFormData({
        grado: grado.grado,
        seccion: grado.seccion,
        docente: grado.docente,
      });
    } else {
      setEditingGrado(null);
      setFormData({
        grado: '',
        seccion: '',
        docente: '',
      });
    }
    setErrors({});
    setError('');
    setSuccess('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGrado(null);
    setFormData({ grado: '', seccion: '', docente: '' });
    setErrors({});
    setError('');
    setSuccess('');
    setFormError(null);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (formError) {
      setFormError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    
    if (!formData.grado) {
      newErrors.grado = 'El grado es requerido';
    }
    if (!formData.seccion) {
      newErrors.seccion = 'La sección es requerida';
    }
    if (!formData.docente.trim()) {
      newErrors.docente = 'El nombre del docente es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingGrado) {
        await api.put(`/grado-seccion/${editingGrado.id}`, { docente: formData.docente });
        setSuccess('Docente actualizado correctamente');
      } else {
        await api.post('/grados-secciones', formData);
        setSuccess('Grado creado correctamente');
      }

      fetchGrados();
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string; errors?: Errors } } };
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const apiErrors: Errors = {};
        let hasDuplicateError = false;
        
        Object.keys(error.response.data.errors).forEach(key => {
          const errorMessage = error.response?.data?.errors?.[key]?.[0] || 'Error de validación';
          apiErrors[key] = errorMessage;
          
          if (errorMessage.includes('ya ha sido tomado') || errorMessage.includes('unique')) {
            hasDuplicateError = true;
          }
        });
        
        setErrors(apiErrors);
        
        if (hasDuplicateError) {
          setFormError('Este grado y sección ya se encuentran registrados.');
        }
      } else if (error.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.response?.status === 500) {
        setError('Error interno del servidor. Por favor intenta de nuevo más tarde.');
      } else {
        setError(error.response?.data?.message || 'Error al guardar el grado');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldError: string) => 
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
      fieldError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Grados</h1>
          <p className="text-gray-500">Administra los grados y secciones del sistema</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Grado
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">Cargando grados...</p>
        </div>
      ) : grados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500">No hay grados registrados</p>
          <p className="text-sm text-gray-400 mt-1">Crea tu primer grado haciendo clic en el botón de arriba</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grados.map((grado) => (
            <div key={grado.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{grado.grado} - Sección {grado.seccion}</h3>
                  <p className="text-sm text-gray-500">Grado</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Docente</p>
                <p className="text-sm font-medium text-gray-700">{grado.docente}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModal(grado)}
                  className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingGrado ? 'Editar Grado' : 'Nuevo Grado'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingGrado ? 'Modifica los datos del grado' : 'Completa los datos del nuevo grado'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grado <span className="text-red-500">*</span>
                  </label>
                  {editingGrado ? (
                    <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                      {formData.grado}
                    </div>
                  ) : (
                    <select
                      value={formData.grado}
                      onChange={(e) => handleChange('grado', e.target.value)}
                      className={inputClass(errors.grado)}
                    >
                      <option value="">Seleccionar grado</option>
                      <option value="1ero">1ero</option>
                      <option value="2do">2do</option>
                      <option value="3ero">3ero</option>
                      <option value="4to">4to</option>
                      <option value="5to">5to</option>
                      <option value="6to">6to</option>
                    </select>
                  )}
                  {errors.grado && (
                    <p className="mt-1 text-xs text-red-500">{errors.grado}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sección <span className="text-red-500">*</span>
                  </label>
                  {editingGrado ? (
                    <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                      Sección {formData.seccion}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {['A', 'B', 'C'].map((seccion) => (
                        <label
                          key={seccion}
                          className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition ${
                            formData.seccion === seccion
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="seccion"
                            value={seccion}
                            checked={formData.seccion === seccion}
                            onChange={(e) => handleChange('seccion', e.target.value)}
                            className="sr-only"
                          />
                          <span className="font-medium">Sección {seccion}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {errors.seccion && (
                    <p className="mt-1 text-xs text-red-500">{errors.seccion}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Docente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={formData.docente}
                      onChange={(e) => handleChange('docente', e.target.value)}
                      className={`${inputClass(errors.docente)} pl-10`}
                      placeholder="Nombre del docente"
                    />
                  </div>
                  {errors.docente && (
                    <p className="mt-1 text-xs text-red-500">{errors.docente}</p>
                  )}
                </div>
              </div>

              {formError && (
                <div className="px-6 pb-2">
                  <p className="text-sm text-red-600 text-center">{formError}</p>
                </div>
              )}

              <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {editingGrado ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
