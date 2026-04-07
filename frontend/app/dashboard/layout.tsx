'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveItem = () => {
    if (pathname === '/dashboard') return 'Inicio';
    if (pathname.includes('/estudiantes')) return 'Estudiantes';
    if (pathname.includes('/grados')) return 'Grados';
    if (pathname.includes('/reportes')) return 'Reportes';
    if (pathname.includes('/configuracion')) return 'Configuración';
    return 'Inicio';
  };

  const getTitle = () => {
    if (pathname === '/dashboard') return 'Bienvenido Administrador';
    if (pathname === '/dashboard/estudiantes') return 'Estudiantes';
    if (pathname === '/dashboard/estudiantes/agregar') return 'Nuevo Estudiante';
    if (pathname.includes('/grados')) return 'Grados';
    if (pathname.includes('/reportes')) return 'Reportes';
    if (pathname.includes('/configuracion')) return 'Configuración';
    return 'Bienvenido Administrador';
  };

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
  }, [router]);


  return (
    <div className="flex min-h-screen">
      <Sidebar activeItem={getActiveItem()} />
      <div className="flex-1 flex flex-col bg-[#E8F1F9]">
        <Header title={getTitle()} />
        <main className="flex-1 p-6 relative">
          {children}
        </main>
        <footer className="text-xs text-center text-gray-500 py-4 mt-auto border-t border-gray-200 bg-white">
          © 2026 Unidad Educativa Cesar Augusto Agreda. 
          Esta obra está bajo una{' '}
          <a 
            href="https://creativecommons.org/licenses/by-nc/4.0/deed.es" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Licencia Creative Commons Atribución-NoComercial 4.0 Internacional (CC BY-NC 4.0)
          </a>
        </footer>
      </div>
    </div>
  );
}
