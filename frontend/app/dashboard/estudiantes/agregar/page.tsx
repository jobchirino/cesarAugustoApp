'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { getAuthToken } from '@/lib/api';

interface EstudianteData {
  nombre_apellido: string;
  cedula_estudiantil: string;
  genero: string;
  grado_id: string;
  registro_medico: string;
  fecha_nacimiento: string;
}

interface RepresentanteData {
  nombre_apellido: string;
  telefono: string;
  direccion: string;
  cedula: string;
}

interface Errors {
  [key: string]: string;
}

interface grado {
  id: number;
  grado: string;
  seccion: string;
  docente: string;
}

export default function AgregarEstudiantePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [ grados, setGrados] = useState<grado[]>([]);

  const [estudiante, setEstudiante] = useState<EstudianteData>({
    nombre_apellido: '',
    cedula_estudiantil: '',
    genero: '',
    grado_id: '',
    registro_medico: '',
    fecha_nacimiento: '',
  });

  const [representante, setRepresentante] = useState<RepresentanteData>({
    nombre_apellido: '',
    telefono: '',
    direccion: '',
    cedula: '',
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

    api.get('/grados-secciones')
      .then((res) => setGrados(res.data))
      .catch(() => {
        setError('Error al cargar los grados. Por favor recarga la página.');
      });
  }, [router]);

  const handleEstudianteChange = (field: keyof EstudianteData, value: string) => {
    setEstudiante({ ...estudiante, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleRepresentanteChange = (field: keyof RepresentanteData, value: string) => {
    setRepresentante({ ...representante, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Errors = {};
    
    if (!estudiante.nombre_apellido.trim()) {
      newErrors.nombre_apellido = 'El nombre es requerido';
    }
    if (!estudiante.cedula_estudiantil.trim()) {
      newErrors.cedula_estudiantil = 'La cédula es requerida';
    }
    if (!estudiante.genero) {
      newErrors.genero = 'El género es requerido';
    }
    if (!estudiante.grado_id) {
      newErrors.grado_id = 'El grado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Errors = {};
    
    if (!representante.nombre_apellido.trim()) {
      newErrors.nombre_apellido = 'El nombre es requerido';
    }
    if (!representante.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    if (!representante.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    }
    if (!representante.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinuar = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    let estudianteId: number | null = null;

    try {
      const estudianteResponse = await api.post('/estudiantes', estudiante);
      estudianteId = estudianteResponse.data.id;

      try {
        await api.post('/representantes', {
          ...representante,
          estudiante_id: estudianteId,
        });

        setSuccess('Estudiante y representante registrados correctamente');
        setTimeout(() => {
          router.push('/dashboard/estudiantes');
        }, 2000);
      } catch (representanteError: unknown) {
        const err = representanteError as { response?: { status?: number; data?: { message?: string; errors?: Errors } } };
        
        if (estudianteId) {
          try {
            await api.delete(`/estudiantes/${estudianteId}`);
          } catch {
            console.error('Error al eliminar estudiante huérfano');
          }
        }

        if (err.response?.status === 422 && err.response?.data?.errors) {
          const repErrors: Errors = {};
          Object.keys(err.response.data.errors).forEach(key => {
            repErrors[key] = err.response?.data?.errors?.[key]?.[0] || 'Error de validación';
          });
          setErrors(repErrors);
          setError('Error al registrar el representante. Por favor verifica los datos.');
        } else if (err.response?.status === 500) {
          setError('Error interno del servidor. Por favor intenta de nuevo más tarde.');
        } else {
          setError(err.response?.data?.message || 'Error al registrar el representante');
        }
      }
    } catch (estudianteError: unknown) {
      const err = estudianteError as { response?: { status?: number; data?: { message?: string; errors?: Errors } } };
      
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const estErrors: Errors = {};
        Object.keys(err.response.data.errors).forEach(key => {
          estErrors[key] = err.response?.data?.errors?.[key]?.[0] || 'Error de validación';
        });
        setErrors(estErrors);
        setCurrentStep(1);
        setError('Error al registrar el estudiante. Por favor verifica los datos.');
      } else if (err.response?.status === 500) {
        setError('Error interno del servidor. Por favor intenta de nuevo más tarde.');
      } else if (err.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Error al registrar el estudiante');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAtras = () => {
    setCurrentStep(1);
    setError('');
    setErrors({});
  };

  const inputClass = (fieldError: string) => 
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
      fieldError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
    }`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nuevo Estudiante</h1>
        <p className="text-gray-500">Completa los datos del estudiante y su representante</p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg">
          {success}
        </div>
      )}

      {error && !errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className={`ml-2 font-medium ${currentStep >= 1 ? 'text-gray-800' : 'text-gray-500'}`}>
                Datos del Estudiante
              </span>
            </div>

            <div className="w-24 h-0.5 mx-4 bg-gray-200">
              <div className={`h-full bg-blue-600 transition-all ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>

            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={`ml-2 font-medium ${currentStep >= 2 ? 'text-gray-800' : 'text-gray-500'}`}>
                Datos del Representante
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={currentStep === 1 ? handleContinuar : handleSubmit}>
          <div className="p-6">
            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre y Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={estudiante.nombre_apellido}
                    onChange={(e) => handleEstudianteChange('nombre_apellido', e.target.value)}
                    className={inputClass(errors.nombre_apellido)}
                    placeholder="Juan Pérez"
                  />
                  {errors.nombre_apellido && (
                    <p className="mt-1 text-xs text-red-500">{errors.nombre_apellido}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula Estudiantil <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={estudiante.cedula_estudiantil}
                    onChange={(e) => handleEstudianteChange('cedula_estudiantil', e.target.value)}
                    className={inputClass(errors.cedula_estudiantil)}
                    placeholder="V-12345678"
                  />
                  {errors.cedula_estudiantil && (
                    <p className="mt-1 text-xs text-red-500">{errors.cedula_estudiantil}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Género <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={estudiante.genero}
                    onChange={(e) => handleEstudianteChange('genero', e.target.value)}
                    className={inputClass(errors.genero)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                  {errors.genero && (
                    <p className="mt-1 text-xs text-red-500">{errors.genero}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grado <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={estudiante.grado_id}
                    onChange={(e) => handleEstudianteChange('grado_id', e.target.value)}
                    className={inputClass(errors.grado_id)}
                  >
                    <option value="">Seleccionar</option>
                    {grados.map((grado) => (
                      <option key={grado.id} value={grado.id}>
                        {grado.grado} - Sección {grado.seccion}
                      </option>
                    ))}
                  </select>
                  {errors.grado_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.grado_id}</p>
                  )}
                  {grados.length === 0 && !error && (
                    <p className="mt-1 text-xs text-yellow-600">No hay grados disponibles. Crea uno primero.</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={estudiante.fecha_nacimiento}
                    onChange={(e) => handleEstudianteChange('fecha_nacimiento', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registro Médico
                  </label>
                  <textarea
                    value={estudiante.registro_medico}
                    onChange={(e) => handleEstudianteChange('registro_medico', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Alergias, enfermedades, medicamentos, etc."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre y Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={representante.nombre_apellido}
                    onChange={(e) => handleRepresentanteChange('nombre_apellido', e.target.value)}
                    className={inputClass(errors.nombre_apellido)}
                    placeholder="María García"
                  />
                  {errors.nombre_apellido && (
                    <p className="mt-1 text-xs text-red-500">{errors.nombre_apellido}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={representante.telefono}
                    onChange={(e) => handleRepresentanteChange('telefono', e.target.value)}
                    className={inputClass(errors.telefono)}
                    placeholder="0412-1234567"
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={representante.cedula}
                    onChange={(e) => handleRepresentanteChange('cedula', e.target.value)}
                    className={inputClass(errors.cedula)}
                    placeholder="V-87654321"
                  />
                  {errors.cedula && (
                    <p className="mt-1 text-xs text-red-500">{errors.cedula}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={representante.direccion}
                    onChange={(e) => handleRepresentanteChange('direccion', e.target.value)}
                    className={inputClass(errors.direccion)}
                    placeholder="Calle 123, Ciudad"
                  />
                  {errors.direccion && (
                    <p className="mt-1 text-xs text-red-500">{errors.direccion}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleAtras}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Registrando...' : currentStep === 1 ? 'Continuar' : 'Registrar Estudiante y Representante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
