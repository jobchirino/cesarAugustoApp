'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';
import CierreEscolarModal from '@/components/CierreEscolarModal';
import Image from 'next/image';

interface Stats {
  estudiantes: number;
  grados: number;
  asistencias: number;
}

const quickAccess = [
  { name: 'Registrar Nuevo Estudiante', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', color: 'bg-blue-500', href: '/dashboard/estudiantes/agregar' },
  { name: 'Ver Estudiantes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-green-500', href: '/dashboard/estudiantes' },
  { name: 'Gestión de Grados', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'bg-purple-500', href: '/dashboard/grados' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ estudiantes: 0, grados: 0, asistencias: 0 });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSuperAdmin(data.id === 1);
      })
      .catch(() => setIsSuperAdmin(false));

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => {
        console.error('Error al cargar datos:', err);
      })
      .finally(() => setLoading(false));
  }, [router, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Estudiantes</p>
            <p className="text-3xl font-bold text-gray-800">{stats.estudiantes}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Grados Activos</p>
            <p className="text-3xl font-bold text-gray-800">{stats.grados}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Asistencias</p>
            <p className="text-3xl font-bold text-gray-800">{stats.asistencias}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Accesos Directos</h2>
        <div className="grid grid-cols-4 gap-4">
          {quickAccess.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{item.name}</span>
            </Link>
          ))}
          {isSuperAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition border-2 border-red-100"
            >
              <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-red-600 text-center">Cerrar Año Escolar</span>
            </button>
          )}
        </div>
      </div>
      <CierreEscolarModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setRefreshKey(k => k + 1);
          alert('El año escolar se ha cerrado correctamente.');
        }}
      />
      <Image
        src={'/logo.png'}
        className='absolute bottom-6 right-5'
        alt="Logo"
        width={200}
        height={200}
      />
    </>
  );
}
