'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api, { getAuthToken } from '@/lib/api';

interface Grado {
  id: number;
  grado: string;
  seccion: string;
}

interface Estudiante {
  id: number;
  nombre_apellido: string;
  cedula_estudiantil: string;
  genero: string;
  registro_medico: string | null;
  grado_id: number;
  representante?: Representante;
}

interface Representante {
  id: number;
  nombre_apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
}

export default function EditarEstudiantePage() {
  const router = useRouter();
  const params = useParams();
  const estudianteId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [grados, setGrados] = useState<Grado[]>([]);

  const [estudianteForm, setEstudianteForm] = useState({
    nombre_apellido: '',
    cedula_estudiantil: '',
    genero: '',
    registro_medico: '',
    grado_id: '',
  });

  const [representanteForm, setRepresentanteForm] = useState({
    nombre_apellido: '',
    cedula: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/grados-secciones')
      .then((res) => setGrados(res.data))
      .catch((err) => console.error('Error al cargar grados: ', err));

    api.get(`/estudiantes/${estudianteId}`)
      .then((res) => {
        const data = res.data;
        setEstudianteForm({
          nombre_apellido: data.nombre_apellido || '',
          cedula_estudiantil: data.cedula_estudiantil || '',
          genero: data.genero || '',
          registro_medico: data.registro_medico || '',
          grado_id: data.grado_id?.toString() || '',
        });
        if (data.representante) {
          setRepresentanteForm({
            nombre_apellido: data.representante.nombre_apellido || '',
            cedula: data.representante.cedula || '',
            telefono: data.representante.telefono || '',
            direccion: data.representante.direccion || '',
          });
        }
      })
      .catch((err) => {
        console.error('Error al cargar estudiante: ', err);
        setError('Error al cargar los datos del estudiante');
      })
      .finally(() => setLoading(false));
  }, [router, estudianteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        nombre_apellido: estudianteForm.nombre_apellido,
        cedula_estudiantil: estudianteForm.cedula_estudiantil,
        genero: estudianteForm.genero,
        registro_medico: estudianteForm.registro_medico || null,
        grado_id: parseInt(estudianteForm.grado_id),
        representante: {
          nombre_apellido: representanteForm.nombre_apellido,
          cedula: representanteForm.cedula,
          telefono: representanteForm.telefono,
          direccion: representanteForm.direccion,
        },
      };

      await api.put(`/estudiantes/${estudianteId}`, payload);
      setSuccess('Estudiante actualizado correctamente');
      setTimeout(() => {
        router.push('/dashboard/estudiantes');
      }, 1500);
    } catch (err: any) {
      console.error('Error al actualizar: ', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al actualizar el estudiante');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-800">Editar Estudiante</h1>
          <p className="text-gray-500 mt-1">Actualiza los datos del estudiante y su representante</p>
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

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos del Estudiante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre y Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={estudianteForm.nombre_apellido}
                  onChange={(e) => setEstudianteForm({ ...estudianteForm, nombre_apellido: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula Estudiantil <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={estudianteForm.cedula_estudiantil}
                  onChange={(e) => setEstudianteForm({ ...estudianteForm, cedula_estudiantil: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género <span className="text-red-500">*</span>
                </label>
                <select
                  value={estudianteForm.genero}
                  onChange={(e) => setEstudianteForm({ ...estudianteForm, genero: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grado/Sección <span className="text-red-500">*</span>
                </label>
                <select
                  value={estudianteForm.grado_id}
                  onChange={(e) => setEstudianteForm({ ...estudianteForm, grado_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  {grados.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grado} - Sección {g.seccion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registro Médico
                </label>
                <textarea
                  value={estudianteForm.registro_medico}
                  onChange={(e) => setEstudianteForm({ ...estudianteForm, registro_medico: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Enfermedades, alergias, etc."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos del Representante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre y Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={representanteForm.nombre_apellido}
                  onChange={(e) => setRepresentanteForm({ ...representanteForm, nombre_apellido: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={representanteForm.cedula}
                  onChange={(e) => setRepresentanteForm({ ...representanteForm, cedula: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={representanteForm.telefono}
                  onChange={(e) => setRepresentanteForm({ ...representanteForm, telefono: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={representanteForm.direccion}
                  onChange={(e) => setRepresentanteForm({ ...representanteForm, direccion: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/estudiantes"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
