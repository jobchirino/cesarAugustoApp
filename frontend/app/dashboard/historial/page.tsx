'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/api';

interface Historial {
  id: number;
  año_escolar: string;
  total_estudiantes: number;
  total_asistencias: number;
  total_inasistencias: number;
  created_at: string;
}

export default function HistorialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historiales, setHistoriales] = useState<Historial[]>([]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/historial`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistoriales(data))
      .catch((err) => console.error('Error al cargar historial:', err))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Historial de Años Escolares</h1>
      
      {historiales.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-500">
          No hay registros de historial.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año Escolar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Estudiantes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Asistencias</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Inasistencias</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Cierre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historiales.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.año_escolar}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.total_estudiantes}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.total_asistencias}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.total_inasistencias}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('es-VE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
