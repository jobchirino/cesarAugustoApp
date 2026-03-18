'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api, { getAuthToken } from '@/lib/api';

interface Grado {
  id: number;
  grado: string;
  seccion: string;
  docente: string;
}

interface Representante {
  id: number;
  nombre_apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
}

interface Asistencia {
  id: number;
  fecha: string;
  estado: 'Asistio' | 'Falto' | 'Justificado';
  observacion: string | null;
}

interface NotaAcademica {
  id: number;
  lapso: string;
  boletin: string;
}

interface Estudiante {
  id: number;
  nombre_apellido: string;
  cedula_estudiantil: string;
  genero: string;
  registro_medico: string | null;
  grado_id: number;
  cantidad_asistencias: number;
  cantidad_inasistencias: number;
  observaciones_inasistencias: string | null;
  grado?: Grado;
  representante?: Representante;
  asistencias?: Asistencia[];
  notas_academicas?: NotaAcademica[];
}

export default function EstudianteDetallePage() {
  const router = useRouter();
  const params = useParams();
  const estudianteId = params?.id;

  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [asistenciaForm, setAsistenciaForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    estado: 'Asistio' as 'Asistio' | 'Falto' | 'Justificado',
    observacion: '',
  });

  const [notaForm, setNotaForm] = useState({
    lapso: '',
    boletin: '',
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetchEstudiante();
  }, [router, estudianteId]);

  const fetchEstudiante = () => {
    api.get(`/estudiantes/${estudianteId}`)
      .then((res) => {
        setEstudiante(res.data);
      })
      .catch((err) => {
        console.error('Error al obtener estudiante: ', err);
        setError('Error al cargar los datos del estudiante');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAsistenciaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/asistencias', {
        estudiante_id: estudianteId,
        fecha: asistenciaForm.fecha,
        estado: asistenciaForm.estado,
        observacion: asistenciaForm.observacion || null,
      });
      setSuccess('Asistencia registrada correctamente');
      setAsistenciaForm({
        fecha: new Date().toISOString().split('T')[0],
        estado: 'Asistio',
        observacion: '',
      });
      fetchEstudiante();
    } catch (err: any) {
      setError('Error al registrar la asistencia');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/notas-academicas', {
        estudiante_id: estudianteId,
        lapso: notaForm.lapso,
        boletin: notaForm.boletin,
      });
      setSuccess('Nota registrada correctamente');
      setNotaForm({ lapso: '', boletin: '' });
      setEstudiante(null);
      fetchEstudiante();
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al registrar la nota');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getLapseLabel = (lapso: string) => {
    const labels: Record<string, string> = {
      '1': '1er Lapso',
      '2': '2do Lapso',
      '3': '3er Lapso',
      'Final': 'Nota Final',
    };
    return labels[lapso] || lapso;
  };

  const puedeAgregarNota = estudiante && (!estudiante.notas_academicas || estudiante.notas_academicas.length < 4);

  const lapsosDisponibles = [
    { value: '1', label: '1er Lapso' },
    { value: '2', label: '2do Lapso' },
    { value: '3', label: '3er Lapso' },
    { value: 'Final', label: 'Nota Final' },
  ].filter(l => !estudiante?.notas_academicas?.some(n => n.lapso === l.value));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!estudiante) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Estudiante no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard/estudiantes"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la lista
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{estudiante.nombre_apellido}</h1>
          <p className="text-gray-500 mt-1">Cédula: {estudiante.cedula_estudiantil}</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos Básicos</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Género:</span>
                <span className="text-gray-800 font-medium">{estudiante.genero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Grado/Sección:</span>
                <span className="text-gray-800 font-medium">
                  {estudiante.grado?.grado} - Sección {estudiante.grado?.seccion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Docente:</span>
                <span className="text-gray-800 font-medium">{estudiante.grado?.docente || 'No asignado'}</span>
              </div>
              <div>
                <span className="text-gray-500">Registro Médico:</span>
                <p className="text-gray-800 mt-1 text-sm">{estudiante.registro_medico || 'Sin registro médico'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Representante</h2>
            {estudiante.representante ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre:</span>
                  <span className="text-gray-800 font-medium">{estudiante.representante.nombre_apellido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cédula:</span>
                  <span className="text-gray-800 font-medium">{estudiante.representante.cedula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="text-gray-800 font-medium">{estudiante.representante.telefono}</span>
                </div>
                <div>
                  <span className="text-gray-500">Dirección:</span>
                  <p className="text-gray-800 mt-1 text-sm">{estudiante.representante.direccion}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sin representante registrado</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Asistencias</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Historial</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600 font-medium">Fecha</th>
                      <th className="px-4 py-2 text-left text-gray-600 font-medium">Estado</th>
                      <th className="px-4 py-2 text-left text-gray-600 font-medium">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {estudiante.asistencias && estudiante.asistencias.length > 0 ? (
                      estudiante.asistencias.map((a) => (
                        <tr key={a.id}>
                          <td className="px-4 py-2 text-gray-800">{a.fecha.split('T')[0]}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              a.estado === 'Asistio' ? 'bg-green-100 text-green-700' :
                              a.estado === 'Falto' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {a.estado === 'Asistio' ? 'Asistió' : a.estado === 'Falto' ? 'Faltó' : 'Justificado'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-600">{a.observacion || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                          No hay registros de asistencia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Registrar Asistencia</h3>
              <form onSubmit={handleAsistenciaSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={asistenciaForm.fecha}
                    onChange={(e) => setAsistenciaForm({ ...asistenciaForm, fecha: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={asistenciaForm.estado}
                    onChange={(e) => setAsistenciaForm({ ...asistenciaForm, estado: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Asistio">Asistió</option>
                    <option value="Falto">Faltó</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    value={asistenciaForm.observacion}
                    onChange={(e) => setAsistenciaForm({ ...asistenciaForm, observacion: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Opcional"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Registrar Asistencia'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notas Académicas</h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Historial</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 font-medium">Lapso</th>
                    <th className="px-4 py-2 text-left text-gray-600 font-medium">Observaciones/Boletín</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {estudiante.notas_academicas && estudiante.notas_academicas.length > 0 ? (
                    estudiante.notas_academicas.map((n) => (
                      <tr key={n.id}>
                        <td className="px-4 py-2 text-gray-800 font-medium">{getLapseLabel(n.lapso)}</td>
                        <td className="px-4 py-2 text-gray-600">{n.boletin || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-center text-gray-500">
                        No hay notas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {puedeAgregarNota ? (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Agregar Nota</h3>
              <form onSubmit={handleNotaSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lapso</label>
                  <select
                    value={notaForm.lapso}
                    onChange={(e) => setNotaForm({ ...notaForm, lapso: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar lapsos</option>
                    {lapsosDisponibles.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">boletin/Boletín</label>
                  <textarea
                    value={notaForm.boletin}
                    onChange={(e) => setNotaForm({ ...notaForm, boletin: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="boletin del boletín"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Agregar Nota'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600 font-medium">Registro académico completo (3 Lapsos y Nota Final)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
