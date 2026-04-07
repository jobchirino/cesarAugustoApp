'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getAuthToken } from '@/lib/api';

interface Estudiante {
  id: number;
  nombre_apellido: string;
  cedula_estudiantil: string;
  genero: string;
  grado_id: number;
  grado?: {
    id: number;
    grado: string;
    seccion: string;
  };
}

interface GradoSeccion {
  id: number;
  grado: string;
  seccion: string;
  docente: string;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function EstudiantesPage() {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [estudianteToDelete, setEstudianteToDelete] = useState<Estudiante | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [busquedaInput, setBusquedaInput] = useState('');
  const [gradoFiltro, setGradoFiltro] = useState<string>('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  const [grados, setGrados] = useState<GradoSeccion[]>([]);

  const fetchGrados = useCallback(() => {
    api.get('/grados-secciones')
      .then((res) => setGrados(res.data))
      .catch((err) => console.error('Error al obtener grados: ', err));
  }, []);

  const fetchEstudiantes = useCallback(() => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    params.append('page', paginaActual.toString());
    
    if (busqueda.trim()) {
      params.append('search', busqueda.trim());
    }
    if (gradoFiltro) {
      params.append('grado_id', gradoFiltro);
    }

    api.get(`/estudiantes?${params.toString()}`)
      .then((res) => {
        setEstudiantes(res.data.data);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
        });
      })
      .catch((err) => {
        console.error('Error al obtener estudiantes: ', err);
        setError('Error al cargar los estudiantes');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paginaActual, busqueda, gradoFiltro]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/security-questions/status`, {
      headers: { Authorization: `Bearer ${token}` },
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
  }, [router, fetchGrados]);

  useEffect(() => {
    fetchEstudiantes();
  }, [fetchEstudiantes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busquedaInput !== busqueda) {
        setBusqueda(busquedaInput);
        setPaginaActual(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [busquedaInput, busqueda]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusqueda(busquedaInput);
    setPaginaActual(1);
  };

  const handleGradoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGradoFiltro(e.target.value);
    setPaginaActual(1);
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.last_page) {
      setPaginaActual(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteClick = (estudiante: Estudiante) => {
    setEstudianteToDelete(estudiante);
    setShowModal(true);
    setError('');
  };

  const handleConfirmDelete = async () => {
    if (!estudianteToDelete) return;

    setDeleting(true);
    setError('');

    try {
      await api.delete(`/estudiantes/${estudianteToDelete.id}`);
      fetchEstudiantes();
      setShowModal(false);
      setEstudianteToDelete(null);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.response?.status === 500) {
        setError('Error interno del servidor. Por favor intenta de nuevo más tarde.');
      } else {
        setError(error.response?.data?.message || 'Error al eliminar el estudiante');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setEstudianteToDelete(null);
    setError('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
          <p className="text-gray-500">
            {pagination ? `${pagination.total} estudiantes registrados` : 'Cargando...'}
          </p>
        </div>
        <Link
          href="/dashboard/estudiantes/agregar"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          + Agregar Estudiante
        </Link>
      </div>

      <div className="mb-4 flex gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {busquedaInput && (
              <button
                type="button"
                onClick={() => {
                  setBusquedaInput('');
                  setBusqueda('');
                  setPaginaActual(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        <select
          value={gradoFiltro}
          onChange={handleGradoChange}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-w-[180px]"
        >
          <option value="">Todos los grados</option>
          {grados.map((grado) => (
            <option key={grado.id} value={grado.id}>
              {grado.grado} - Sección {grado.seccion}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Género</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Cargando estudiantes...</span>
                    </div>
                  </td>
                </tr>
              ) : estudiantes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {busqueda || gradoFiltro 
                      ? 'No se encontraron estudiantes con los filtros aplicados' 
                      : 'No hay estudiantes registrados'}
                  </td>
                </tr>
              ) : (
                estudiantes.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-medium">
                            {estudiante.nombre_apellido.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{estudiante.nombre_apellido}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {estudiante.cedula_estudiantil}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {estudiante.genero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {estudiante.grado?.grado} - Sección {estudiante.grado?.seccion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/estudiantes/${estudiante.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Ver">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link href={`/dashboard/estudiantes/${estudiante.id}/editar`} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(estudiante)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded" 
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
              </span>{' '}
              de <span className="font-medium">{pagination.total}</span> estudiantes
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 text-center mb-6">
              ¿Estás seguro de que deseas eliminar al estudiante <strong>{estudianteToDelete?.nombre_apellido}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {deleting ? 'Eliminando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
